import type { AiTutorMessageRole } from "@prisma/client"

import {
  type ChatMessage,
  type ChatSession,
  DEFAULT_CHAT_TITLE,
  titleFromFirstMessage,
} from "@/features/ai-tutor/model/chat-data"
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
    createdAt: Date
  }>
}

function mapMessage(row: SessionRow["messages"][number]): ChatMessage {
  return {
    id: row.id,
    role: row.role === "USER" ? "user" : "assistant",
    content: row.content,
    timestamp: row.createdAt,
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
        role: "user" | "assistant"
        content: string
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
      await tx.aiTutorChatMessage.deleteMany({
        where: { sessionId },
      })

      if (input.messages.length > 0) {
        await tx.aiTutorChatMessage.createMany({
          data: input.messages.map((message) => ({
            sessionId,
            role: message.role === "user" ? "USER" : "ASSISTANT",
            content: message.content,
          })),
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
        let generatedTitle = titleFromFirstMessage(firstUserMessage.content)

        try {
          generatedTitle = await generateAiTutorChatTitle(
            firstUserMessage.content
          )
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
