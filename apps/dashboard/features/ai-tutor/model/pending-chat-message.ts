const PENDING_CHAT_MESSAGE_KEY = "ai-tutor-pending-message"
const PENDING_CHAT_MESSAGE_PROCESSING_KEY =
  "ai-tutor-pending-message-processing"

export function setPendingChatMessage(message: string) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(PENDING_CHAT_MESSAGE_KEY, message.trim())
  sessionStorage.removeItem(PENDING_CHAT_MESSAGE_PROCESSING_KEY)
}

export function takePendingChatMessage(): string | null {
  if (typeof window === "undefined") return null
  if (sessionStorage.getItem(PENDING_CHAT_MESSAGE_PROCESSING_KEY) === "1") {
    return null
  }

  const value = sessionStorage.getItem(PENDING_CHAT_MESSAGE_KEY)?.trim()
  if (!value) return null

  sessionStorage.setItem(PENDING_CHAT_MESSAGE_PROCESSING_KEY, "1")
  sessionStorage.removeItem(PENDING_CHAT_MESSAGE_KEY)
  return value
}

export function clearPendingChatMessageProcessing() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(PENDING_CHAT_MESSAGE_PROCESSING_KEY)
}
