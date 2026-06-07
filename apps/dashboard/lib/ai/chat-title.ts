export const AI_TUTOR_CHAT_TITLE_PROMPT = `You name student tutoring chats on an educational platform.

Given the student's first message, write a short, specific chat title that captures the topic.

Rules:
- 3 to 6 words
- Title case
- No quotes, colons, markdown, or trailing punctuation
- Reply with the title only`

export function sanitizeChatTitle(raw: string, fallback: string): string {
  const cleaned = raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^title:\s*/i, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")

  if (!cleaned) {
    return fallback
  }

  if (cleaned.length <= 80) {
    return cleaned
  }

  return `${cleaned.slice(0, 77).trim()}…`
}
