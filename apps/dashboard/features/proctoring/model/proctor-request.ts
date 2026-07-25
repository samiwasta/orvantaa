import { z } from "zod"

import { PROCTOR_VIOLATION_KINDS } from "./proctor-rules"

export const startProctorSessionSchema = z.object({
  quizId: z.string().min(1),
})

export const recordProctorViolationSchema = z.object({
  kind: z.enum(PROCTOR_VIOLATION_KINDS),
  questionIndex: z.number().int().min(0).max(999).optional(),
  detail: z.string().trim().max(300).optional(),
})

export const endProctorSessionSchema = z.object({
  reason: z.enum(["COMPLETED", "ABANDONED"]),
})

export function parseStartProctorSession(body: unknown) {
  return startProctorSessionSchema.safeParse(body)
}

export function parseRecordProctorViolation(body: unknown) {
  return recordProctorViolationSchema.safeParse(body)
}

export function parseEndProctorSession(body: unknown) {
  return endProctorSessionSchema.safeParse(body)
}
