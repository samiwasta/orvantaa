import { NextResponse } from "next/server"
import { z } from "zod"

import { aiTutorFeedbackRepository } from "@/features/ai-tutor/repository/ai-tutor-feedback.repository"
import { requireStudentSession } from "@/lib/auth/session"

const feedbackSchema = z.object({
  feedback: z.enum(["like", "dislike"]).nullable(),
})

type RouteContext = {
  params: Promise<{ messageId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authSession = await requireStudentSession()
    const { messageId } = await context.params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const parsed = feedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback." }, { status: 400 })
    }

    const updated = await aiTutorFeedbackRepository.updateMessageFeedback(
      authSession.sub,
      messageId,
      parsed.data.feedback
    )

    if (updated === null) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 })
    }

    return NextResponse.json({ feedback: updated })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}
