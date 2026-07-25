import type {
  ProctorSessionStatus,
  ProctorViolationKind,
} from "./proctor-rules"

export type QuizSessionReportViolation = {
  id: string
  kind: ProctorViolationKind
  label: string
  title: string
  message: string
  warningNumber: number | null
  questionIndex: number | null
  detail: string | null
  occurredAt: string
}

export type QuizSessionReport = {
  sessionId: string
  status: ProctorSessionStatus
  outcome: "completed" | "terminated" | "abandoned"
  warningCount: number
  warningLimit: number
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
  student: {
    firstName: string
    lastName: string
    email: string
    studentCode: string | null
  }
  quiz: {
    title: string
    chapterTitle: string
    chapterNumber: number
    subjectName: string
  }
  attempt: {
    id: string
    scorePercent: number
    correctCount: number
    totalQuestions: number
    answeredCount: number
    timeSpentSeconds: number | null
    terminatedByProctor: boolean
    completedAt: string
  } | null
  violations: QuizSessionReportViolation[]
  helpHref: string
}
