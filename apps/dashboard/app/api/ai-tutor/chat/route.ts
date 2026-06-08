import { NextResponse } from "next/server"

import { parseAiTutorChatRequest } from "@/features/ai-tutor/model/chat-request"
import { getAiTutorSetupHint, isAiTutorConfigured } from "@/lib/ai/config"
import { generateAiTutorChatResponse } from "@/lib/ai/generate-chat-response"
import { buildWidgetScopedSystemPrompt } from "@/lib/ai/prompts"
import { requireStudentSession } from "@/lib/auth/session"

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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    )
  }

  const parsed = parseAiTutorChatRequest(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chat messages." },
      { status: 400 }
    )
  }

  try {
    const chatOptions = parsed.data.scope
      ? {
          systemPrompt: buildWidgetScopedSystemPrompt(parsed.data.scope),
          maxTokens: 512,
        }
      : undefined

    const content = await generateAiTutorChatResponse(
      parsed.data.messages,
      chatOptions
    )
    return NextResponse.json({ content })
  } catch (error) {
    console.error("[ai-tutor] Chat failed:", error)
    const message =
      error instanceof Error ? error.message : "Could not generate a response."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
