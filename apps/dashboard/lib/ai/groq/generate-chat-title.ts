import { AI_TUTOR_CHAT_TITLE_PROMPT, sanitizeChatTitle } from "../chat-title"
import { getGroqConfig } from "./config"

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
  error?: {
    message?: string
  }
}

export async function generateGroqChatTitle(
  firstUserMessage: string,
  fallbackTitle: string
): Promise<string> {
  const config = getGroqConfig()
  if (!config.enabled) {
    return fallbackTitle
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        max_tokens: 24,
        messages: [
          { role: "system", content: AI_TUTOR_CHAT_TITLE_PROMPT },
          { role: "user", content: firstUserMessage.trim() },
        ],
      }),
    }
  )

  const payload = (await response
    .json()
    .catch(() => null)) as GroqChatResponse | null

  if (!response.ok) {
    return fallbackTitle
  }

  const text = payload?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    return fallbackTitle
  }

  return sanitizeChatTitle(text, fallbackTitle)
}
