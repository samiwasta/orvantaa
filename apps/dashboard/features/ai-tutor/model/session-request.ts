import { z } from "zod"

const chatMessageAttachmentSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  kind: z.enum(["image", "document"]),
})

export const syncAiTutorSessionSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  messages: z
    .array(
      z
        .object({
          id: z.string().trim().min(1).max(80).optional(),
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().max(8000),
          attachments: z.array(chatMessageAttachmentSchema).max(5).optional(),
          feedback: z.enum(["like", "dislike"]).nullable().optional(),
        })
        .superRefine((message, context) => {
          if (
            message.role === "user" &&
            !message.content &&
            !message.attachments?.length
          ) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: "User messages require text or attachments.",
            })
          }

          if (message.role === "assistant" && !message.content) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Assistant messages require text.",
            })
          }
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
