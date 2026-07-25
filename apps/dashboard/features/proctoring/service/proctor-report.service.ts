import { createHash, randomBytes } from "crypto"

import {
  type ProctorSessionStatus,
  proctorViolationRule,
} from "../model/proctor-rules"
import type { QuizSessionReport } from "../model/quiz-session-report"
import { proctorRepository } from "../repository/proctor.repository"

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex")
}

function outcomeFromStatus(
  status: ProctorSessionStatus
): QuizSessionReport["outcome"] {
  if (status === "TERMINATED") return "terminated"
  if (status === "ABANDONED") return "abandoned"
  return "completed"
}

export class ProctorReportService {
  constructor(private readonly repository = proctorRepository) {}

  createRawReportToken(): { rawToken: string; tokenHash: string } {
    const rawToken = randomBytes(32).toString("hex")
    return { rawToken, tokenHash: hashToken(rawToken) }
  }

  async getReportByRawToken(
    rawToken: string
  ): Promise<QuizSessionReport | null> {
    const token = rawToken.trim()
    if (!token) return null

    const row = await this.repository.findReportByTokenHash(hashToken(token))
    if (!row) return null

    const chapterTitle = row.quiz.chapter.title
    const endedAt = row.endedAt ?? row.attempt?.completedAt ?? null

    return {
      sessionId: row.id,
      status: row.status,
      outcome: outcomeFromStatus(row.status),
      warningCount: row.warningCount,
      warningLimit: row.warningLimit,
      startedAt: row.startedAt.toISOString(),
      endedAt: endedAt ? endedAt.toISOString() : null,
      durationSeconds: endedAt
        ? Math.max(
            0,
            Math.round((endedAt.getTime() - row.startedAt.getTime()) / 1000)
          )
        : null,
      student: {
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        email: row.user.email,
        studentCode: row.user.studentCode,
      },
      quiz: {
        title: row.quiz.title,
        chapterTitle,
        chapterNumber: row.quiz.chapter.number,
        subjectName: row.quiz.chapter.subject.title,
      },
      attempt: row.attempt
        ? {
            id: row.attempt.id,
            scorePercent: row.attempt.scorePercent,
            correctCount: row.attempt.correctCount,
            totalQuestions: row.attempt.totalQuestions,
            answeredCount: row.attempt.answeredCount,
            timeSpentSeconds: row.attempt.timeSpentSeconds,
            terminatedByProctor: row.attempt.terminatedByProctor,
            completedAt: row.attempt.completedAt.toISOString(),
          }
        : null,
      violations: row.violations.map((violation) => {
        const rule = proctorViolationRule(violation.kind)
        return {
          id: violation.id,
          kind: violation.kind,
          label: rule.label,
          title: rule.title,
          message: rule.message,
          warningNumber: violation.warningNumber,
          questionIndex: violation.questionIndex,
          detail: violation.detail,
          occurredAt: violation.occurredAt.toISOString(),
        }
      }),
      helpHref: "/help",
    }
  }
}

export const proctorReportService = new ProctorReportService()
