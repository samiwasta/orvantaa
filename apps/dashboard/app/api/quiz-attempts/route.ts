import { NextResponse } from "next/server"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { parseSubmitQuizAttempt } from "@/features/performance/model/activity-request"
import { quizAttemptRepository } from "@/features/performance/repository/quiz-attempt.repository"
import { requireStudentSession } from "@/lib/auth/session"

export async function POST(request: Request) {
  try {
    const authSession = await requireStudentSession()
    const classId = await loadStudentClassId()
    if (!classId) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 })
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

    const parsed = parseSubmitQuizAttempt(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quiz attempt." },
        { status: 400 }
      )
    }

    const access = await quizAttemptRepository.verifyQuizAccess(
      authSession.sub,
      parsed.data.quizId,
      classId
    )
    if (!access) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 })
    }

    const attempt = await quizAttemptRepository.createAttempt({
      userId: authSession.sub,
      quizId: parsed.data.quizId,
      answers: parsed.data.answers,
      timeSpentSeconds: parsed.data.timeSpentSeconds,
    })

    if (!attempt) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 })
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        scorePercent: attempt.scorePercent,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const message =
      error instanceof Error ? error.message : "Could not save quiz attempt."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
