export type ChapterStatus = "completed" | "in_progress" | "not_started"

export type ChapterItem = {
  number: number
  title: string
  slug: string
  status: ChapterStatus
  progressPercent: number
  recommended?: boolean
}

export function chapterSlug(chapter: ChapterItem): string {
  return chapter.slug
}

export function getLearningObjectives(chapter: ChapterItem): string[] {
  return [
    `Understanding key concepts in ${chapter.title}`,
    `Practicing ${chapter.title.toLowerCase()} step-by-step`,
    "Applying ideas to real-life situations",
  ]
}

export type TopicStatus = "completed" | "in_progress" | "not_started"

export type TopicItem = {
  id: string
  title: string
  duration: string
  status: TopicStatus
  firstNoteId: string | null
}

export type QuizDifficulty = "easy" | "medium" | "hard"
export type QuizStatus = "completed" | "available" | "locked"

export type QuizItem = {
  id: string
  title: string
  questions: number
  difficulty: QuizDifficulty
  status: QuizStatus
  score?: number
}
