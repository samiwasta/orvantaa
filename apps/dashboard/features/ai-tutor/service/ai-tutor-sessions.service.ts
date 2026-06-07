import type { ChatMessage, ChatSession } from "../model/chat-data"
import { deserializeChatSession } from "../model/serialize-chat-session"

type ApiErrorPayload = {
  error?: string
  message?: string
}

const fetchOptions: RequestInit = {
  credentials: "same-origin",
}

async function readJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null
}

function readApiError(payload: ApiErrorPayload | null, fallback: string) {
  return payload?.error ?? payload?.message ?? fallback
}

export async function fetchAiTutorSession(
  sessionId: string
): Promise<ChatSession> {
  const response = await fetch(
    `/api/ai-tutor/sessions/${sessionId}`,
    fetchOptions
  )
  const payload = await readJson<{ session?: ChatSession } & ApiErrorPayload>(
    response
  )

  if (!response.ok) {
    throw new Error(readApiError(payload, "Could not load this chat."))
  }

  if (!payload?.session) {
    throw new Error("Could not load this chat.")
  }

  return deserializeChatSession(payload.session)
}

export async function createAiTutorSession(
  title: string
): Promise<ChatSession> {
  const response = await fetch("/api/ai-tutor/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
    ...fetchOptions,
  })

  const payload = await readJson<{ session?: ChatSession } & ApiErrorPayload>(
    response
  )

  if (!response.ok) {
    throw new Error(readApiError(payload, "Could not start a new chat."))
  }

  if (!payload?.session) {
    throw new Error("Could not start a new chat.")
  }

  return deserializeChatSession(payload.session)
}

export async function syncAiTutorSession(
  sessionId: string,
  input: {
    title?: string
    messages: ChatMessage[]
  }
): Promise<ChatSession> {
  const response = await fetch(`/api/ai-tutor/sessions/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      messages: input.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
    ...fetchOptions,
  })

  const payload = await readJson<{ session?: ChatSession } & ApiErrorPayload>(
    response
  )

  if (!response.ok) {
    throw new Error(readApiError(payload, "Could not save this chat."))
  }

  if (!payload?.session) {
    throw new Error("Could not save this chat.")
  }

  return deserializeChatSession(payload.session)
}

export async function deleteAiTutorSession(sessionId: string): Promise<void> {
  const response = await fetch(`/api/ai-tutor/sessions/${sessionId}`, {
    method: "DELETE",
    ...fetchOptions,
  })

  const payload = await readJson<ApiErrorPayload>(response)

  if (!response.ok) {
    throw new Error(readApiError(payload, "Could not delete this chat."))
  }
}
