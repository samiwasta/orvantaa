import type { ChapterItem, QuizItem } from "./chapter-data"

export type McqOption = {
  id: string
  dbId: string
  label: string
}

export type McqQuestion = {
  id: string
  dbId: string
  question: string
  options: McqOption[]
  correctOptionId: string
}

export type QuizSession = {
  quiz: QuizItem
  chapterSlug: string
  questions: McqQuestion[]
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const

export function optionDisplayLabel(optionId: string): string {
  const index = ["a", "b", "c", "d"].indexOf(optionId)
  return index >= 0 ? OPTION_LABELS[index]! : optionId.toUpperCase()
}
