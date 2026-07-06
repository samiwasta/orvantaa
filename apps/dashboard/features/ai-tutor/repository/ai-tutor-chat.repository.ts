import type { AiTutorMessageRole, Prisma } from "@prisma/client"

import {
  type ChatMessage,
  type ChatMessageAttachment,
  type ChatSession,
  DEFAULT_CHAT_TITLE,
  titleFromFirstMessage,
} from "@/features/ai-tutor/model/chat-data"
import {
  mapDbFeedback,
  toDbFeedback,
} from "@/features/ai-tutor/repository/ai-tutor-feedback.repository"
import { generateAiTutorChatTitle } from "@/lib/ai/generate-chat-title"
import { prisma } from "@/lib/db"

type SessionRow = {
  id: string
  title: string
  updatedAt: Date
  messages: Array<{
    id: string
    role: AiTutorMessageRole
    content: string
    attachments: Prisma.JsonValue | null
    feedback: import("@prisma/client").AiTutorMessageFeedback | null
    createdAt: Date
  }>
}

function parseStoredAttachments(
  value: Prisma.JsonValue | null
): ChatMessageAttachment[] | undefined {
  if (!Array.isArray(value)) return undefined

  const attachments: ChatMessageAttachment[] = value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return []
    }

    const record = entry as Record<string, unknown>
    const kind = record.kind
    if (
      typeof record.id !== "string" ||
      typeof record.name !== "string" ||
      (kind !== "image" && kind !== "document")
    ) {
      return []
    }

    return [
      {
        id: record.id,
        name: record.name,
        kind,
        previewUrl: null,
      },
    ]
  })

  return attachments.length > 0 ? attachments : undefined
}

function mapMessage(row: SessionRow["messages"][number]): ChatMessage {
  return {
    id: row.id,
    role: row.role === "USER" ? "user" : "assistant",
    content: row.content,
    timestamp: row.createdAt,
    attachments: parseStoredAttachments(row.attachments),
    feedback:
      row.role === "ASSISTANT"
        ? mapDbFeedback(row.feedback ?? null)
        : undefined,
  }
}

function mapSession(row: SessionRow): ChatSession {
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt,
    messages: row.messages.map(mapMessage),
  }
}

function shouldAutoGenerateTitle(
  currentTitle: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  explicitTitle?: string
) {
  if (explicitTitle) {
    return false
  }

  const firstUserMessage = messages.find((message) => message.role === "user")
  const hasAssistantReply = messages.some(
    (message) => message.role === "assistant"
  )

  return (
    currentTitle === DEFAULT_CHAT_TITLE &&
    Boolean(firstUserMessage) &&
    hasAssistantReply
  )
}

export class AiTutorChatRepository {
  async listSessionsForUser(userId: string): Promise<ChatSession[]> {
    const rows = await prisma.aiTutorChatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 2,
        },
      },
    })

    return rows.map(mapSession)
  }

  async findSessionForUser(
    userId: string,
    sessionId: string
  ): Promise<ChatSession | null> {
    const row = await prisma.aiTutorChatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    return row ? mapSession(row) : null
  }

  async createSession(userId: string, title: string): Promise<ChatSession> {
    const row = await prisma.aiTutorChatSession.create({
      data: {
        userId,
        title,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    return mapSession(row)
  }

  async syncSessionMessages(
    userId: string,
    sessionId: string,
    input: {
      title?: string
      messages: Array<{
        id?: string
        role: "user" | "assistant"
        content: string
        attachments?: ChatMessageAttachment[]
        feedback?: ChatMessage["feedback"]
      }>
    }
  ): Promise<ChatSession | null> {
    const existing = await prisma.aiTutorChatSession.findFirst({
      where: { id: sessionId, userId },
      select: { id: true, title: true },
    })

    if (!existing) {
      return null
    }

    const row = await prisma.$transaction(async (tx) => {
      const incomingIds = input.messages
        .map((message) => message.id)
        .filter((id): id is string => Boolean(id))

      await tx.aiTutorChatMessage.deleteMany({
        where: {
          sessionId,
          ...(incomingIds.length > 0 ? { id: { notIn: incomingIds } } : {}),
        },
      })

      for (const message of input.messages) {
        const role: AiTutorMessageRole =
          message.role === "user" ? "USER" : "ASSISTANT"
        const attachments =
          message.attachments && message.attachments.length > 0
            ? message.attachments.map((attachment) => ({
                id: attachment.id,
                name: attachment.name,
                kind: attachment.kind,
              }))
            : undefined

        const baseData = {
          sessionId,
          role,
          content: message.content,
          attachments,
        }

        if (message.id) {
          await tx.aiTutorChatMessage.upsert({
            where: { id: message.id },
            create: {
              id: message.id,
              ...baseData,
              feedback:
                message.role === "assistant"
                  ? toDbFeedback(message.feedback ?? null)
                  : null,
            },
            update: {
              ...baseData,
              ...(message.role === "assistant" && message.feedback !== undefined
                ? { feedback: toDbFeedback(message.feedback) }
                : {}),
            },
          })
          continue
        }

        await tx.aiTutorChatMessage.create({
          data: {
            ...baseData,
            feedback:
              message.role === "assistant"
                ? toDbFeedback(message.feedback ?? null)
                : null,
          },
        })
      }

      return tx.aiTutorChatSession.update({
        where: { id: sessionId },
        data: {
          ...(input.title ? { title: input.title } : {}),
          updatedAt: new Date(),
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    })

    let session = mapSession(row)

    if (shouldAutoGenerateTitle(existing.title, input.messages, input.title)) {
      const firstUserMessage = input.messages.find(
        (message) => message.role === "user"
      )

      if (firstUserMessage) {
        const titleSource =
          firstUserMessage.content.trim() ||
          firstUserMessage.attachments?.map((item) => item.name).join(", ") ||
          DEFAULT_CHAT_TITLE

        let generatedTitle = titleFromFirstMessage(titleSource)

        try {
          generatedTitle = await generateAiTutorChatTitle(titleSource)
        } catch (error) {
          console.error("[ai-tutor] Title generation failed:", error)
        }

        const titled = await prisma.aiTutorChatSession.update({
          where: { id: sessionId },
          data: { title: generatedTitle },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        })

        session = mapSession(titled)
      }
    }

    return session
  }

  async deleteSessionForUser(
    userId: string,
    sessionId: string
  ): Promise<boolean> {
    const existing = await prisma.aiTutorChatSession.findFirst({
      where: { id: sessionId, userId },
      select: { id: true },
    })

    if (!existing) {
      return false
    }

    await prisma.aiTutorChatSession.delete({
      where: { id: sessionId },
    })

    return true
  }
}

export const aiTutorChatRepository = new AiTutorChatRepository()
