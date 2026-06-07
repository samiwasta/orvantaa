import { z } from "zod"

export const submitQuizAttemptSchema = z.object({
  quizId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        optionId: z.string().min(1),
      })
    )
    .min(1),
  timeSpentSeconds: z.number().int().min(0).optional(),
})

export const noteProgressSchema = z.object({
  status: z.enum(["VIEWED", "COMPLETED"]),
})

export function parseSubmitQuizAttempt(body: unknown) {
  return submitQuizAttemptSchema.safeParse(body)
}

export function parseNoteProgress(body: unknown) {
  return noteProgressSchema.safeParse(body)
}
