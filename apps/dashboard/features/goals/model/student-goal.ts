export type StudentGoalType =
  | "COMPLETE_CHAPTERS"
  | "REVISE_CHAPTER"
  | "PASS_QUIZ"
  | "IMPROVE_WEAK_AREA"
  | "MAINTAIN_STREAK"

export type StudentGoalStatus = "ACTIVE" | "COMPLETED" | "EXPIRED" | "DISMISSED"

export type StudentGoalSource = "AI" | "SYSTEM"

export type GoalChapterTarget = {
  chapterId: string
  subjectTitle: string
  chapterTitle: string
  subjectSlug: string
  chapterSlug: string
  href: string
}

export type StudentGoalMetadata = {
  chapterIds?: string[]
  subjectSlug?: string
  chapterSlug?: string
  subjectTitle?: string
  chapterTitle?: string
  targets?: GoalChapterTarget[]
  instruction?: string
  quizId?: string
  minQuizScore?: number
  targetStreak?: number
}

export type StudentExamTarget = {
  examName: string
  examDate: Date
}

export type StudentGoal = {
  id: string
  type: StudentGoalType
  title: string
  description: string | null
  rationale: string | null
  targetCount: number
  progressCount: number
  status: StudentGoalStatus
  periodStart: Date
  periodEnd: Date
  priority: number
  href: string | null
  metadata: StudentGoalMetadata | null
  source: StudentGoalSource
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export type GoalsPageData = {
  examTarget: StudentExamTarget | null
  activeGoals: StudentGoal[]
  completedGoals: StudentGoal[]
  daysUntilExam: number | null
  syllabusSummary: {
    completedChapters: number
    totalChapters: number
  }
  journey: {
    activeSteps: number
    completedSteps: number
    overallPercent: number
  }
}

export type GeneratedGoalDraft = {
  type: StudentGoalType
  title: string
  description?: string
  rationale?: string
  targetCount: number
  periodDays: number
  priority?: number
  href?: string
  metadata?: StudentGoalMetadata
}
