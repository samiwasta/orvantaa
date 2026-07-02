import { z } from "zod"

export const aiTutorChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().max(8000),
})

export const aiTutorChatRequestSchema = z.object({
  messages: z.array(aiTutorChatMessageSchema).min(1).max(40),
  scope: z
    .object({
      title: z.string().trim().min(1).max(500),
      mode: z.enum(["note", "quiz"]).optional(),
      content: z.string().trim().min(1).max(8000).optional(),
    })
    .optional(),
})

export type AiTutorChatRequest = z.infer<typeof aiTutorChatRequestSchema>

export type AiTutorChatResponse = {
  content: string
}

export function parseAiTutorChatRequest(raw: unknown) {
  return aiTutorChatRequestSchema.safeParse(raw)
}
