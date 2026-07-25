import type { ChatMessageAttachment } from "@/features/ai-tutor/model/chat-data"

import type { AiTutorWidgetScope } from "./ai-tutor-scope"

export type WidgetChatMessage = {
  role: "user" | "assistant"
  content: string
  attachments?: ChatMessageAttachment[]
}

type StoredWidgetChat = {
  messages: WidgetChatMessage[]
}

const STORAGE_PREFIX = "orvantaa:ai-tutor-widget:v1:"

function hashString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export function widgetChatStorageKey(scope: AiTutorWidgetScope): string {
  const mode = scope.mode ?? "note"
  const fingerprint = hashString(
    `${mode}|${scope.title}|${scope.content ?? ""}`
  )
  return `${STORAGE_PREFIX}${mode}:${fingerprint}`
}

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined"
}

function sanitizeMessages(messages: WidgetChatMessage[]): WidgetChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    attachments: message.attachments?.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      kind: attachment.kind,
      // Blob preview URLs do not survive remounts / navigation.
      previewUrl:
        attachment.previewUrl && !attachment.previewUrl.startsWith("blob:")
          ? attachment.previewUrl
          : undefined,
    })),
  }))
}

export function readWidgetChatSession(
  scope: AiTutorWidgetScope
): WidgetChatMessage[] {
  if (!canUseSessionStorage()) return []

  try {
    const raw = sessionStorage.getItem(widgetChatStorageKey(scope))
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredWidgetChat
    if (!Array.isArray(parsed.messages)) return []
    return sanitizeMessages(
      parsed.messages.filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string"
      )
    )
  } catch {
    return []
  }
}

export function writeWidgetChatSession(
  scope: AiTutorWidgetScope,
  messages: WidgetChatMessage[]
): void {
  if (!canUseSessionStorage()) return

  try {
    const key = widgetChatStorageKey(scope)
    if (messages.length === 0) {
      sessionStorage.removeItem(key)
      return
    }
    const payload: StoredWidgetChat = {
      messages: sanitizeMessages(messages),
    }
    sessionStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Ignore quota / private-mode failures.
  }
}
