import { z } from "zod"

export const syncAiTutorSessionSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(8000),
      })
    )
    .max(80),
})

export const createAiTutorSessionSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
})

export function parseCreateAiTutorSession(raw: unknown) {
  return createAiTutorSessionSchema.safeParse(raw)
}

export function parseSyncAiTutorSession(raw: unknown) {
  return syncAiTutorSessionSchema.safeParse(raw)
}
