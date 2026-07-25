import { prisma } from "@/lib/db"

import type {
  ProctorSessionStatus,
  ProctorViolationKind,
} from "../model/proctor-rules"

type AppendViolationInput = {
  sessionId: string
  kind: ProctorViolationKind
  counted: boolean
  questionIndex?: number
  detail?: string
}

export class ProctorRepository {
  async findActiveSession(userId: string, quizId: string) {
    return prisma.quizProctorSession.findFirst({
      where: { userId, quizId, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
    })
  }

  async findTerminatedSession(userId: string, quizId: string) {
    return prisma.quizProctorSession.findFirst({
      where: { userId, quizId, status: "TERMINATED" },
      orderBy: { endedAt: "desc" },
    })
  }

  async findTerminatedQuizIds(userId: string, quizIds: string[]) {
    if (quizIds.length === 0) return []

    const rows = await prisma.quizProctorSession.findMany({
      where: { userId, quizId: { in: quizIds }, status: "TERMINATED" },
      select: { quizId: true },
      distinct: ["quizId"],
    })

    return rows.map((row) => row.quizId)
  }

  async findSessionForUser(sessionId: string, userId: string) {
    return prisma.quizProctorSession.findFirst({
      where: { id: sessionId, userId },
    })
  }

  async createSession(userId: string, quizId: string, warningLimit: number) {
    return prisma.quizProctorSession.create({
      data: { userId, quizId, warningLimit },
    })
  }

  async findLastWarningAt(sessionId: string) {
    const row = await prisma.quizProctorViolation.findFirst({
      where: { sessionId, warningNumber: { not: null } },
      orderBy: { occurredAt: "desc" },
      select: { occurredAt: true },
    })

    return row?.occurredAt ?? null
  }

  async appendViolation(input: AppendViolationInput) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.quizProctorSession.findUnique({
        where: { id: input.sessionId },
      })
      if (!session) return null

      const warningNumber = input.counted ? session.warningCount + 1 : null
      const terminated =
        warningNumber !== null && warningNumber >= session.warningLimit
      const now = new Date()

      await tx.quizProctorViolation.create({
        data: {
          sessionId: session.id,
          kind: input.kind,
          warningNumber,
          questionIndex: input.questionIndex,
          detail: input.detail,
          occurredAt: now,
        },
      })

      const updated = await tx.quizProctorSession.update({
        where: { id: session.id },
        data: {
          lastSeenAt: now,
          ...(warningNumber !== null ? { warningCount: warningNumber } : {}),
          ...(terminated
            ? { status: "TERMINATED" as ProctorSessionStatus, endedAt: now }
            : {}),
        },
      })

      return { session: updated, warningNumber, terminated }
    })
  }

  async closeSession(
    sessionId: string,
    status: Exclude<ProctorSessionStatus, "IN_PROGRESS">,
    attemptId?: string,
    reportTokenHash?: string
  ) {
    return prisma.quizProctorSession.update({
      where: { id: sessionId },
      data: {
        status,
        endedAt: new Date(),
        lastSeenAt: new Date(),
        ...(attemptId ? { attemptId } : {}),
        ...(reportTokenHash ? { reportTokenHash } : {}),
      },
    })
  }

  async findReportByTokenHash(tokenHash: string) {
    return prisma.quizProctorSession.findFirst({
      where: { reportTokenHash: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentCode: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            chapter: {
              select: {
                title: true,
                number: true,
                subject: { select: { title: true } },
              },
            },
          },
        },
        attempt: {
          select: {
            id: true,
            scorePercent: true,
            correctCount: true,
            totalQuestions: true,
            answeredCount: true,
            timeSpentSeconds: true,
            proctorWarnings: true,
            terminatedByProctor: true,
            completedAt: true,
          },
        },
        violations: {
          orderBy: { occurredAt: "asc" },
          select: {
            id: true,
            kind: true,
            warningNumber: true,
            questionIndex: true,
            detail: true,
            occurredAt: true,
          },
        },
      },
    })
  }

  async countViolations(sessionId: string) {
    return prisma.quizProctorViolation.count({ where: { sessionId } })
  }
}

export const proctorRepository = new ProctorRepository()
