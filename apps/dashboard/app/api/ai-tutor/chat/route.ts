import { NextResponse } from "next/server"

import { parseAiTutorChatRequest } from "@/features/ai-tutor/model/chat-request"
import { buildMultimodalUserContent } from "@/lib/ai/attachments/build-multimodal-content"
import { processChatAttachments } from "@/lib/ai/attachments/process-chat-attachments"
import { getAiTutorSetupHint, isAiTutorConfigured } from "@/lib/ai/config"
import { generateAiTutorChatResponse } from "@/lib/ai/generate-chat-response"
import { buildWidgetScopedSystemPrompt } from "@/lib/ai/prompts"
import type { AiChatMessage } from "@/lib/ai/types"
import { requireStudentSession } from "@/lib/auth/session"

export const maxDuration = 60

function isMultipartRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? ""
  return contentType.includes("multipart/form-data")
}

function attachmentValidationError(error: unknown): string {
  return error instanceof Error ? error.message : "Invalid attachment upload."
}

export async function POST(request: Request) {
  if (!isAiTutorConfigured()) {
    return NextResponse.json(
      {
        error: `AI Tutor is not configured. ${getAiTutorSetupHint()}`,
      },
      { status: 503 }
    )
  }

  try {
    await requireStudentSession()
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let messagesPayload: unknown
  let scopePayload: unknown
  let attachmentFiles: File[] = []

  if (isMultipartRequest(request)) {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: "Invalid upload payload." },
        { status: 400 }
      )
    }

    const messagesRaw = formData.get("messages")
    if (typeof messagesRaw !== "string") {
      return NextResponse.json(
        { error: "Invalid chat messages." },
        { status: 400 }
      )
    }

    try {
      messagesPayload = JSON.parse(messagesRaw)
    } catch {
      return NextResponse.json(
        { error: "Invalid chat messages." },
        { status: 400 }
      )
    }

    const scopeRaw = formData.get("scope")
    if (typeof scopeRaw === "string" && scopeRaw.trim()) {
      try {
        scopePayload = JSON.parse(scopeRaw)
      } catch {
        return NextResponse.json({ error: "Invalid scope." }, { status: 400 })
      }
    }

    attachmentFiles = formData
      .getAll("attachments")
      .filter(
        (entry): entry is File =>
          entry instanceof File &&
          entry.size > 0 &&
          entry.name.trim().length > 0
      )
  } else {
    try {
      const body = await request.json()
      messagesPayload = body?.messages
      scopePayload = body?.scope
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }
  }

  const parsed = parseAiTutorChatRequest({
    messages: messagesPayload,
    scope: scopePayload,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chat messages." },
      { status: 400 }
    )
  }

  const lastMessage = parsed.data.messages[parsed.data.messages.length - 1]
  if (lastMessage?.role !== "user") {
    return NextResponse.json(
      { error: "The last message must be from the user." },
      { status: 400 }
    )
  }

  if (!lastMessage.content.trim() && attachmentFiles.length === 0) {
    return NextResponse.json(
      { error: "Message text or attachments are required." },
      { status: 400 }
    )
  }

  let processedAttachments
  try {
    processedAttachments = await processChatAttachments(attachmentFiles)
  } catch (error) {
    return NextResponse.json(
      { error: attachmentValidationError(error) },
      { status: 400 }
    )
  }

  if (!lastMessage.content.trim() && processedAttachments.length === 0) {
    return NextResponse.json(
      { error: "Message text or attachments are required." },
      { status: 400 }
    )
  }

  const history = parsed.data.messages.slice(0, -1)
  const aiMessages: AiChatMessage[] = [
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    {
      role: "user" as const,
      content: buildMultimodalUserContent(
        lastMessage.content,
        processedAttachments
      ),
    },
  ]

  try {
    const chatOptions = parsed.data.scope
      ? {
          systemPrompt: buildWidgetScopedSystemPrompt(parsed.data.scope),
          maxTokens: 512,
        }
      : undefined

    const content = await generateAiTutorChatResponse(aiMessages, chatOptions)
    return NextResponse.json({ content })
  } catch (error) {
    console.error("[ai-tutor] Chat failed:", error)
    const message =
      error instanceof Error ? error.message : "Could not generate a response."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
