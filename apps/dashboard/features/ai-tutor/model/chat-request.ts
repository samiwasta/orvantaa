import { z } from "zod"

export const aiTutorChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(8000),
      })
    )
    .min(1)
    .max(40),
})

export type AiTutorChatRequest = z.infer<typeof aiTutorChatRequestSchema>

export type AiTutorChatResponse = {
  content: string
}

export function parseAiTutorChatRequest(raw: unknown) {
  return aiTutorChatRequestSchema.safeParse(raw)
}
