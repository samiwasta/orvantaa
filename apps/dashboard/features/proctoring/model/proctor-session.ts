import type {
  ProctorSessionStatus,
  ProctorViolationKind,
} from "./proctor-rules"

export type ProctorSessionState = {
  id: string
  quizId: string
  status: ProctorSessionStatus
  warningCount: number
  warningLimit: number
  resumed: boolean
}

export type ProctorViolationResult = {
  session: ProctorSessionState
  kind: ProctorViolationKind
  /** False when the violation was only logged (notice) or absorbed by cooldown. */
  counted: boolean
  warningNumber: number | null
  terminated: boolean
}

export type ProctorLockState = {
  locked: boolean
  warningCount: number
  warningLimit: number
  terminatedAt: string | null
}

export type ProctorEndReason = "COMPLETED" | "ABANDONED"
