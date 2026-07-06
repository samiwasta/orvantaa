export type MessageFeedback = "like" | "dislike" | null

export function parseMessageFeedback(
  value: string | null | undefined
): MessageFeedback {
  if (value === "like" || value === "dislike") return value
  return null
}
