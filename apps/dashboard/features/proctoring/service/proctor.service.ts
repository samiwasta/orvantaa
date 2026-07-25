import {
  isProctorWarning,
  PROCTOR_WARNING_COOLDOWN_MS,
  PROCTOR_WARNING_LIMIT,
  type ProctorSessionStatus,
  type ProctorViolationKind,
} from "../model/proctor-rules"
import type {
  ProctorEndReason,
  ProctorLockState,
  ProctorSessionState,
  ProctorViolationResult,
} from "../model/proctor-session"
import { proctorRepository } from "../repository/proctor.repository"
import { proctorReportService } from "./proctor-report.service"

type SessionRow = {
  id: string
  quizId: string
  status: ProctorSessionStatus
  warningCount: number
  warningLimit: number
}

type StartSessionResult = {
  lock: ProctorLockState | null
  session: ProctorSessionState | null
  resumeWarning: ProctorViolationResult | null
}

type RecordViolationInput = {
  kind: ProctorViolationKind
  questionIndex?: number
  detail?: string
}

function toSessionState(
  row: SessionRow,
  resumed: boolean
): ProctorSessionState {
  return {
    id: row.id,
    quizId: row.quizId,
    status: row.status,
    warningCount: row.warningCount,
    warningLimit: row.warningLimit,
    resumed,
  }
}

export class ProctorService {
  constructor(private readonly repository = proctorRepository) {}

  async getQuizLock(userId: string, quizId: string): Promise<ProctorLockState> {
    const terminated = await this.repository.findTerminatedSession(
      userId,
      quizId
    )

    if (!terminated) {
      return {
        locked: false,
        warningCount: 0,
        warningLimit: PROCTOR_WARNING_LIMIT,
        terminatedAt: null,
      }
    }

    return {
      locked: true,
      warningCount: terminated.warningCount,
      warningLimit: terminated.warningLimit,
      terminatedAt: (terminated.endedAt ?? terminated.updatedAt).toISOString(),
    }
  }

  async listLockedQuizIds(
    userId: string,
    quizIds: string[]
  ): Promise<Set<string>> {
    const locked = await this.repository.findTerminatedQuizIds(userId, quizIds)
    return new Set(locked)
  }

  /**
   * Starts a fresh proctor session, or resumes the one already running for this
   * quiz. Resuming means the page was reloaded or reopened mid attempt, so the
   * earlier warnings stay and the reload itself is recorded as a warning.
   */
  async startSession(
    userId: string,
    quizId: string
  ): Promise<StartSessionResult> {
    const lock = await this.getQuizLock(userId, quizId)
    if (lock.locked) {
      return { lock, session: null, resumeWarning: null }
    }

    const active = await this.repository.findActiveSession(userId, quizId)
    if (active) {
      const resumeWarning = await this.recordViolation(userId, active.id, {
        kind: "PAGE_RELOAD",
      })

      return {
        lock: null,
        session: resumeWarning
          ? { ...resumeWarning.session, resumed: true }
          : toSessionState(active, true),
        resumeWarning,
      }
    }

    const created = await this.repository.createSession(
      userId,
      quizId,
      PROCTOR_WARNING_LIMIT
    )

    return {
      lock: null,
      session: toSessionState(created, false),
      resumeWarning: null,
    }
  }

  async recordViolation(
    userId: string,
    sessionId: string,
    input: RecordViolationInput
  ): Promise<ProctorViolationResult | null> {
    const session = await this.repository.findSessionForUser(sessionId, userId)
    if (!session) return null

    if (session.status !== "IN_PROGRESS") {
      return {
        session: toSessionState(session, false),
        kind: input.kind,
        counted: false,
        warningNumber: null,
        terminated: session.status === "TERMINATED",
      }
    }

    let counted = isProctorWarning(input.kind)
    if (counted) {
      const lastWarningAt = await this.repository.findLastWarningAt(sessionId)
      if (
        lastWarningAt &&
        Date.now() - lastWarningAt.getTime() < PROCTOR_WARNING_COOLDOWN_MS
      ) {
        counted = false
      }
    }

    const appended = await this.repository.appendViolation({
      sessionId,
      kind: input.kind,
      counted,
      questionIndex: input.questionIndex,
      detail: input.detail,
    })
    if (!appended) return null

    return {
      session: toSessionState(appended.session, false),
      kind: input.kind,
      counted: appended.warningNumber !== null,
      warningNumber: appended.warningNumber,
      terminated: appended.terminated,
    }
  }

  async endSession(
    userId: string,
    sessionId: string,
    reason: ProctorEndReason
  ): Promise<ProctorSessionState | null> {
    const session = await this.repository.findSessionForUser(sessionId, userId)
    if (!session) return null

    if (session.status !== "IN_PROGRESS") {
      return toSessionState(session, false)
    }

    const closed = await this.repository.closeSession(sessionId, reason)
    return toSessionState(closed, false)
  }

  /** Used by quiz submission to grade and close the monitored attempt together. */
  async findSubmissionSession(
    userId: string,
    sessionId: string,
    quizId: string
  ) {
    const session = await this.repository.findSessionForUser(sessionId, userId)
    if (session?.quizId !== quizId) return null
    return session
  }

  async attachAttempt(
    sessionId: string,
    attemptId: string,
    terminated: boolean
  ): Promise<{ reportToken: string }> {
    const { rawToken, tokenHash } = proctorReportService.createRawReportToken()

    await this.repository.closeSession(
      sessionId,
      terminated ? "TERMINATED" : "COMPLETED",
      attemptId,
      tokenHash
    )

    return { reportToken: rawToken }
  }
}

export const proctorService = new ProctorService()
