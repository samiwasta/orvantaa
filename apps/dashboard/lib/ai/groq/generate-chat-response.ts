import { messageHasImageContent } from "../attachments/build-multimodal-content"
import { AI_TUTOR_SYSTEM_PROMPT } from "../prompts"
import type { AiChatMessage, AiChatOptions } from "../types"
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

export async function generateGroqChatResponse(
  messages: AiChatMessage[],
  options?: AiChatOptions
): Promise<string> {
  assertGroqConfigured()

  if (messages.length === 0) {
    throw new Error("At least one message is required.")
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role !== "user") {
    throw new Error("The last message must be from the user.")
  }

  const config = getGroqConfig()
  const usesVision = messages.some(
    (message) =>
      message.role === "user" && messageHasImageContent(message.content)
  )
  const model = usesVision ? config.visionModel : config.model

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: options?.maxTokens ?? 1024,
        messages: [
          {
            role: "system",
            content: options?.systemPrompt ?? AI_TUTOR_SYSTEM_PROMPT,
          },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    }
  )

  const payload = (await response
    .json()
    .catch(() => null)) as GroqChatResponse | null

  if (!response.ok) {
    const apiMessage =
      payload?.error?.message ??
      `Groq request failed with status ${response.status}.`
    throw new Error(`[${response.status}] ${apiMessage}`)
  }

  const text = payload?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw new Error("Groq returned an empty response.")
  }

  return text
}
