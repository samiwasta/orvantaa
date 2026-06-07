import { AI_TUTOR_SYSTEM_PROMPT } from "../prompts"
import type { AiChatMessage } from "../types"
import { getGroqConfig } from "./config"

type GroqStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string | null
    }
  }>
  error?: {
    message?: string
  }
}

function assertGroqConfigured(): void {
  const config = getGroqConfig()
  if (!config.enabled) {
    throw new Error(
      "Groq is not configured. Add GROQ_API_KEY from https://console.groq.com/keys"
    )
  }

  if (!config.apiKey.startsWith("gsk_")) {
    throw new Error(
      "GROQ_API_KEY looks invalid. Create a free key at https://console.groq.com/keys"
    )
  }
}

function validateMessages(messages: AiChatMessage[]): void {
  if (messages.length === 0) {
    throw new Error("At least one message is required.")
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role !== "user") {
    throw new Error("The last message must be from the user.")
  }
}

async function* parseOpenAiSseStream(
  response: Response
): AsyncGenerator<string> {
  if (!response.body) {
    throw new Error("Groq returned an empty streaming response.")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data:")) continue

      const data = trimmed.slice(5).trim()
      if (!data || data === "[DONE]") continue

      let payload: GroqStreamChunk
      try {
        payload = JSON.parse(data) as GroqStreamChunk
      } catch {
        continue
      }

      const delta = payload.choices?.[0]?.delta?.content
      if (delta) {
        yield delta
      }
    }
  }
}

export async function* streamGroqChatResponse(
  messages: AiChatMessage[]
): AsyncGenerator<string> {
  assertGroqConfigured()
  validateMessages(messages)

  const config = getGroqConfig()

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
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
        messages: [
          { role: "system", content: AI_TUTOR_SYSTEM_PROMPT },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    }
  )

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as GroqStreamChunk | null
    const apiMessage =
      payload?.error?.message ??
      `Groq request failed with status ${response.status}.`
    throw new Error(`[${response.status}] ${apiMessage}`)
  }

  let hasContent = false
  for await (const chunk of parseOpenAiSseStream(response)) {
    hasContent = true
    yield chunk
  }

  if (!hasContent) {
    throw new Error("Groq returned an empty response.")
  }
}
