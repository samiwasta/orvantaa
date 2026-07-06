import type { MessageFeedback } from "@/features/ai-tutor/model/message-feedback"
import { parseMessageFeedback } from "@/features/ai-tutor/model/message-feedback"

type ApiErrorPayload = {
  error?: string
  message?: string
}

async function readJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null
}

function readApiError(payload: ApiErrorPayload | null, fallback: string) {
  return payload?.error ?? payload?.message ?? fallback
}

export async function submitAiTutorMessageFeedback(
  messageId: string,
  feedback: MessageFeedback
): Promise<MessageFeedback> {
  const response = await fetch(`/api/ai-tutor/messages/${messageId}/feedback`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ feedback }),
  })

  const payload = await readJson<
    { feedback?: MessageFeedback } & ApiErrorPayload
  >(response)

  if (!response.ok) {
    throw new Error(readApiError(payload, "Could not save feedback."))
  }

  return parseMessageFeedback(payload?.feedback ?? feedback)
}
