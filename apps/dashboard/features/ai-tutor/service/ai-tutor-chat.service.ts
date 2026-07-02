import type {
  AiTutorChatRequest,
  AiTutorChatResponse,
} from "../model/chat-request"

type AiTutorScope = NonNullable<AiTutorChatRequest["scope"]>

export async function requestAiTutorReply(
  messages: AiTutorChatRequest["messages"],
  scope?: AiTutorScope,
  attachments?: File[]
): Promise<AiTutorChatResponse> {
  const hasAttachments = Boolean(attachments && attachments.length > 0)

  const response = await fetch("/api/ai-tutor/chat", {
    method: "POST",
    credentials: "same-origin",
    ...(hasAttachments
      ? {
          body: (() => {
            const formData = new FormData()
            formData.append("messages", JSON.stringify(messages))
            if (scope) {
              formData.append("scope", JSON.stringify(scope))
            }
            for (const file of attachments ?? []) {
              formData.append("attachments", file)
            }
            return formData
          })(),
        }
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, scope }),
        }),
  })

  const payload = (await response.json().catch(() => null)) as
    | AiTutorChatResponse
    | { error?: string; message?: string }
    | null

  if (!response.ok) {
    const message =
      (payload && "error" in payload && payload.error) ||
      (payload && "message" in payload && payload.message) ||
      "Could not get a response from AI Tutor."
    throw new Error(message)
  }

  if (!payload || !("content" in payload) || !payload.content) {
    throw new Error("AI Tutor returned an invalid response.")
  }

  return { content: payload.content }
}
