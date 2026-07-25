import { z } from "zod"

export const submitQuizAttemptSchema = z.object({
  quizId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        // Empty when the student ran out of time or the attempt was terminated.
        optionId: z.string(),
      })
    )
    .min(1),
  timeSpentSeconds: z.number().int().min(0).optional(),
  proctorSessionId: z.string().min(1).optional(),
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
