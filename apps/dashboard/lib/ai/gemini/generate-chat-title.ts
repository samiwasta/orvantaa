import { AI_TUTOR_CHAT_TITLE_PROMPT, sanitizeChatTitle } from "../chat-title"
import { getGeminiConfig, getGeminiModelCandidates } from "./config"
import { assertGeminiConfigured } from "./errors"

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: {
    message?: string
  }
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  firstUserMessage: string
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: AI_TUTOR_CHAT_TITLE_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: firstUserMessage.trim() }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 24,
      },
    }),
  })

  const payload = (await response
    .json()
    .catch(() => null)) as GeminiGenerateContentResponse | null

  if (!response.ok) {
    return null
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim()

  return text || null
}

export async function generateGeminiChatTitle(
  firstUserMessage: string,
  fallbackTitle: string
): Promise<string> {
  assertGeminiConfigured()

  const config = getGeminiConfig()
  const models = getGeminiModelCandidates(config)

  for (const modelName of models) {
    const text = await generateWithModel(
      config.apiKey,
      modelName,
      firstUserMessage
    )

    if (text) {
      return sanitizeChatTitle(text, fallbackTitle)
    }
  }

  return fallbackTitle
}
