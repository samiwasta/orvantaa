import type { MessageFeedback } from "@/features/ai-tutor/model/message-feedback"
import { prisma } from "@/lib/db"
import type { AiTutorMessageFeedback } from "@/lib/generated/prisma"

export type AiTutorFeedbackInsight = {
  content: string
  feedback: "like" | "dislike"
}

export type AiTutorUserFeedbackProfile = {
  liked: AiTutorFeedbackInsight[]
  disliked: AiTutorFeedbackInsight[]
  likeCount: number
  dislikeCount: number
}

const FEEDBACK_SAMPLE_LIMIT = 24
const FEEDBACK_EXCERPT_MAX = 220

function mapDbFeedback(value: AiTutorMessageFeedback | null): MessageFeedback {
  if (value === "LIKE") return "like"
  if (value === "DISLIKE") return "dislike"
  return null
}

function toDbFeedback(value: MessageFeedback): AiTutorMessageFeedback | null {
  if (value === "like") return "LIKE"
  if (value === "dislike") return "DISLIKE"
  return null
}

function excerpt(content: string, max = FEEDBACK_EXCERPT_MAX) {
  const trimmed = content.trim().replace(/\s+/g, " ")
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}

export class AiTutorFeedbackRepository {
  async updateMessageFeedback(
    userId: string,
    messageId: string,
    feedback: MessageFeedback
  ): Promise<MessageFeedback | null> {
    const message = await prisma.aiTutorChatMessage.findFirst({
      where: {
        id: messageId,
        role: "ASSISTANT",
        session: { userId },
      },
      select: { id: true },
    })

    if (!message) {
      return null
    }

    const updated = await prisma.aiTutorChatMessage.update({
      where: { id: messageId },
      data: { feedback: toDbFeedback(feedback) },
      select: { feedback: true },
    })

    return mapDbFeedback(updated.feedback)
  }

  async getUserFeedbackProfile(
    userId: string
  ): Promise<AiTutorUserFeedbackProfile> {
    const rows = await prisma.aiTutorChatMessage.findMany({
      where: {
        role: "ASSISTANT",
        feedback: { not: null },
        session: { userId },
      },
      orderBy: { createdAt: "desc" },
      take: FEEDBACK_SAMPLE_LIMIT,
      select: {
        content: true,
        feedback: true,
      },
    })

    const liked: AiTutorFeedbackInsight[] = []
    const disliked: AiTutorFeedbackInsight[] = []

    for (const row of rows) {
      if (!row.feedback) continue

      const insight: AiTutorFeedbackInsight = {
        content: excerpt(row.content),
        feedback: row.feedback === "LIKE" ? "like" : "dislike",
      }

      if (row.feedback === "LIKE") {
        liked.push(insight)
      } else {
        disliked.push(insight)
      }
    }

    const [likeCount, dislikeCount] = await Promise.all([
      prisma.aiTutorChatMessage.count({
        where: {
          role: "ASSISTANT",
          feedback: "LIKE",
          session: { userId },
        },
      }),
      prisma.aiTutorChatMessage.count({
        where: {
          role: "ASSISTANT",
          feedback: "DISLIKE",
          session: { userId },
        },
      }),
    ])

    return {
      liked,
      disliked,
      likeCount,
      dislikeCount,
    }
  }
}

export const aiTutorFeedbackRepository = new AiTutorFeedbackRepository()

export { mapDbFeedback, toDbFeedback }
