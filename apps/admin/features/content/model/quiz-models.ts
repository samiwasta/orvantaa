import type { QuizDifficulty as PrismaQuizDifficulty } from "@prisma/client"
import { z } from "zod"

export type QuizDifficulty = "easy" | "medium" | "hard"

export type ContentQuizListItem = {
  id: string
  chapterId: string
  title: string
  difficulty: QuizDifficulty
  difficultyLabel: string
  orderIndex: number
  questionCount: number
}

export type QuizOptionDraft = {
  label: string
  isCorrect: boolean
}

export type QuizQuestionDraft = {
  prompt: string
  explanation: string
  options: QuizOptionDraft[]
}

export type QuizEditorData = {
  id: string
  chapterId: string
  title: string
  difficulty: QuizDifficulty
  questions: QuizQuestionDraft[]
}

export const QUIZ_DIFFICULTIES = ["easy", "medium", "hard"] as const

export const QUIZ_DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

export function mapPrismaQuizDifficulty(
  value: PrismaQuizDifficulty
): QuizDifficulty {
  if (value === "EASY") return "easy"
  if (value === "HARD") return "hard"
  return "medium"
}

export function mapQuizDifficultyToPrisma(
  value: QuizDifficulty
): PrismaQuizDifficulty {
  if (value === "easy") return "EASY"
  if (value === "hard") return "HARD"
  return "MEDIUM"
}

export const quizCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(160, "Title is too long"),
  difficulty: z.enum(["easy", "medium", "hard"]),
})

export type QuizCreateInput = z.infer<typeof quizCreateSchema>

const quizOptionSchema = z.object({
  label: z.string().trim().min(1, "Option text is required"),
  isCorrect: z.boolean(),
})

const quizQuestionSchema = z
  .object({
    prompt: z.string().trim().min(1, "Question is required"),
    explanation: z.string().trim().optional().default(""),
    options: z.array(quizOptionSchema).min(2, "At least two options required"),
  })
  .superRefine((question, ctx) => {
    const correctCount = question.options.filter((o) => o.isCorrect).length
    if (correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mark exactly one option as correct",
        path: ["options"],
      })
    }
  })

export const quizSaveSchema = quizCreateSchema.extend({
  questions: z
    .array(quizQuestionSchema)
    .min(1, "Add at least one question"),
})

export type QuizSaveInput = z.infer<typeof quizSaveSchema>

export function createEmptyQuestion(): QuizQuestionDraft {
  return {
    prompt: "",
    explanation: "",
    options: [
      { label: "", isCorrect: true },
      { label: "", isCorrect: false },
      { label: "", isCorrect: false },
      { label: "", isCorrect: false },
    ],
  }
}
