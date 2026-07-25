import { NextResponse } from "next/server"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { goalService } from "@/features/goals/service/goal.service"
import { notificationService } from "@/features/notifications/service/notification.service"
import { parseSubmitQuizAttempt } from "@/features/performance/model/activity-request"
import { quizAttemptRepository } from "@/features/performance/repository/quiz-attempt.repository"
import { proctorService } from "@/features/proctoring/service/proctor.service"
import { quizAttemptEmailService } from "@/features/proctoring/service/quiz-attempt-email.service"
import { requireStudentSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db"

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

    const proctorSession = parsed.data.proctorSessionId
      ? await proctorService.findSubmissionSession(
          authSession.sub,
          parsed.data.proctorSessionId,
          parsed.data.quizId
        )
      : null

    if (parsed.data.proctorSessionId && !proctorSession) {
      return NextResponse.json(
        { error: "Proctoring session not found." },
        { status: 404 }
      )
    }

    const terminatedByProctor = proctorSession?.status === "TERMINATED"

    const attempt = await quizAttemptRepository.createAttempt({
      userId: authSession.sub,
      quizId: parsed.data.quizId,
      answers: parsed.data.answers,
      timeSpentSeconds: parsed.data.timeSpentSeconds,
      proctorWarnings: proctorSession?.warningCount ?? 0,
      terminatedByProctor,
    })

    if (!attempt) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 })
    }

    let reportToken: string | null = null
    if (proctorSession) {
      const attached = await proctorService.attachAttempt(
        proctorSession.id,
        attempt.id,
        terminatedByProctor
      )
      reportToken = attached.reportToken
    }

    if (!terminatedByProctor) {
      await notificationService.notifyQuizCompletedFromAttempt(
        authSession.sub,
        parsed.data.quizId,
        {
          id: attempt.id,
          scorePercent: attempt.scorePercent,
        }
      )
    }

    if (reportToken) {
      const profile = await prisma.user.findUnique({
        where: { id: authSession.sub },
        select: {
          email: true,
          firstName: true,
        },
      })
      const quizMeta = await prisma.quiz.findUnique({
        where: { id: parsed.data.quizId },
        select: {
          title: true,
          chapter: {
            select: {
              subject: { select: { title: true } },
            },
          },
        },
      })

      if (profile?.email && quizMeta) {
        void quizAttemptEmailService
          .sendAttemptReportEmail({
            to: profile.email,
            firstName: profile.firstName,
            quizTitle: quizMeta.title,
            subjectName: quizMeta.chapter.subject.title,
            outcome: terminatedByProctor ? "terminated" : "completed",
            scorePercent: attempt.scorePercent,
            warningCount: proctorSession?.warningCount ?? 0,
            warningLimit: proctorSession?.warningLimit ?? 3,
            reportToken,
          })
          .catch((error) => {
            console.error("[quiz-attempt] Failed to send report email:", error)
          })
      }
    }

    await goalService.reconcileForUser(authSession.sub, classId)

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        scorePercent: attempt.scorePercent,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        terminatedByProctor,
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
