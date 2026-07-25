import { NextResponse } from "next/server"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { quizAttemptRepository } from "@/features/performance/repository/quiz-attempt.repository"
import { parseStartProctorSession } from "@/features/proctoring/model/proctor-request"
import { proctorService } from "@/features/proctoring/service/proctor.service"
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

    const parsed = parseStartProctorSession(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quiz." }, { status: 400 })
    }

    const access = await quizAttemptRepository.verifyQuizAccess(
      authSession.sub,
      parsed.data.quizId,
      classId
    )
    if (!access) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 })
    }

    const result = await proctorService.startSession(
      authSession.sub,
      parsed.data.quizId
    )

    if (result.lock) {
      return NextResponse.json(
        {
          error: "This quiz is locked after a terminated attempt.",
          lock: result.lock,
          session: null,
          resumeWarning: null,
        },
        { status: 423 }
      )
    }

    return NextResponse.json({
      session: result.session,
      lock: null,
      resumeWarning: result.resumeWarning,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message === "Forbidden")
    ) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Could not start the proctored attempt." },
      { status: 400 }
    )
  }
}
