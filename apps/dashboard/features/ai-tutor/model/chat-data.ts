export type ChatRole = "user" | "assistant"

export type ChatMessageFeedback = "like" | "dislike" | null

export type ChatMessageAttachment = {
  id: string
  name: string
  kind: "image" | "document"
  previewUrl?: string | null
}

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  attachments?: ChatMessageAttachment[]
  feedback?: ChatMessageFeedback
}

export type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: Date
}

export type SuggestedPrompt = {
  id: string
  label: string
  prompt: string
}

export const NEW_CHAT_ID = "new"

export const DEFAULT_CHAT_TITLE = "New chat"

export function aiTutorChatHref(chatId: string) {
  return `/ai-tutor/${chatId}`
}

export const suggestedPrompts: SuggestedPrompt[] = [
  {
    id: "explain-concept",
    label: "Explain a concept",
    prompt: "Explain Newton's third law with real-life examples",
  },
  {
    id: "solve-problem",
    label: "Solve a problem",
    prompt: "Solve: A car travels 120km in 2 hours. What is its average speed?",
  },
  {
    id: "quiz-me",
    label: "Quiz me",
    prompt: "Give me 5 MCQs on photosynthesis",
  },
  {
    id: "summarize",
    label: "Summarize a chapter",
    prompt: "Summarize the chapter on Chemical Reactions and Equations",
  },
]

export function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function titleFromFirstMessage(content: string): string {
  const trimmed = content.trim()
  if (trimmed.length <= 48) return trimmed
  return `${trimmed.slice(0, 48)}…`
}
