import type {
  QuizDifficulty as PrismaQuizDifficulty,
  QuizTimedMode as PrismaQuizTimedMode,
} from "@/lib/generated/prisma"
import { isRichContentEmpty } from "@workspace/rich-text"
import { z } from "zod"

export type QuizDifficulty = "easy" | "medium" | "hard"
export type QuizTimedMode = "untimed" | "per_question" | "whole_quiz"

export type ContentQuizListItem = {
  id: string
  chapterId: string
  title: string
  difficulty: QuizDifficulty
  difficultyLabel: string
  timedMode: QuizTimedMode
  timeLimitSeconds: number | null
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
  timedMode: QuizTimedMode
  timeLimitSeconds: number | null
  questions: QuizQuestionDraft[]
}

export const QUIZ_DIFFICULTIES = ["easy", "medium", "hard"] as const

export const QUIZ_DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

export const QUIZ_TIMED_MODES = [
  "untimed",
  "per_question",
  "whole_quiz",
] as const

export const QUIZ_TIMED_MODE_LABELS: Record<QuizTimedMode, string> = {
  untimed: "Untimed",
  per_question: "Per question",
  whole_quiz: "Whole quiz",
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

export function mapPrismaQuizTimedMode(
  value: PrismaQuizTimedMode
): QuizTimedMode {
  if (value === "PER_QUESTION") return "per_question"
  if (value === "WHOLE_QUIZ") return "whole_quiz"
  return "untimed"
}

export function mapQuizTimedModeToPrisma(
  value: QuizTimedMode
): PrismaQuizTimedMode {
  if (value === "per_question") return "PER_QUESTION"
  if (value === "whole_quiz") return "WHOLE_QUIZ"
  return "UNTIMED"
}

export function secondsToMinutes(seconds: number | null): number {
  if (!seconds || seconds <= 0) return 1
  return Math.max(1, Math.round(seconds / 60))
}

export function minutesToSeconds(minutes: number): number {
  return Math.round(minutes * 60)
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
    prompt: z.string(),
    explanation: z.string().optional().default(""),
    options: z.array(quizOptionSchema).min(2, "At least two options required"),
  })
  .superRefine((question, ctx) => {
    if (isRichContentEmpty(question.prompt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Question is required",
        path: ["prompt"],
      })
    }
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

export const quizSaveSchema = quizCreateSchema
  .extend({
    timedMode: z.enum(["untimed", "per_question", "whole_quiz"]),
    timeLimitSeconds: z
      .number()
      .int()
      .min(1, "Time must be at least 1 second")
      .max(86400, "Time cannot exceed 24 hours")
      .nullable()
      .optional(),
    questions: z.array(quizQuestionSchema).min(1, "Add at least one question"),
  })
  .superRefine((data, ctx) => {
    if (data.timedMode === "untimed") return
    if (!data.timeLimitSeconds || data.timeLimitSeconds <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Set a time limit for timed quizzes",
        path: ["timeLimitSeconds"],
      })
    }
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
