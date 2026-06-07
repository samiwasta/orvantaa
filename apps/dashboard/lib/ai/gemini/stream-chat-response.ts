import { AI_TUTOR_SYSTEM_PROMPT } from "../prompts"
import type { AiChatMessage } from "../types"
import { getGeminiConfig, getGeminiModelCandidates } from "./config"
import {
  assertGeminiConfigured,
  isGeminiAccessDeniedError,
  toGeminiUserError,
} from "./errors"

type GeminiStreamResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: {
    message?: string
  }
}

function buildContents(messages: AiChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }))
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

async function* parseGeminiSseStream(
  response: Response
): AsyncGenerator<string> {
  if (!response.body) {
    throw new Error("Gemini returned an empty streaming response.")
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
      if (!data) continue

      let payload: GeminiStreamResponse
      try {
        payload = JSON.parse(data) as GeminiStreamResponse
      } catch {
        continue
      }

      const text = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")

      if (text) {
        yield text
      }
    }
  }
}

async function* streamWithGeminiModel(
  apiKey: string,
  modelName: string,
  messages: AiChatMessage[]
): AsyncGenerator<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:streamGenerateContent?alt=sse`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: AI_TUTOR_SYSTEM_PROMPT }],
      },
      contents: buildContents(messages),
    }),
  })

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as GeminiStreamResponse | null
    const apiMessage =
      payload?.error?.message ??
      `Gemini request failed with status ${response.status}.`
    throw new Error(`[${response.status}] ${apiMessage}`)
  }

  yield* parseGeminiSseStream(response)
}

export async function* streamGeminiChatResponse(
  messages: AiChatMessage[]
): AsyncGenerator<string> {
  assertGeminiConfigured()
  validateMessages(messages)

  const config = getGeminiConfig()
  const models = getGeminiModelCandidates(config)
  let lastError: unknown = null

  for (let index = 0; index < models.length; index += 1) {
    const modelName = models[index]!
    const hasFallback = index < models.length - 1

    try {
      let hasContent = false
      for await (const chunk of streamWithGeminiModel(
        config.apiKey,
        modelName,
        messages
      )) {
        hasContent = true
        yield chunk
      }

      if (!hasContent) {
        throw new Error("Gemini returned an empty response.")
      }

      return
    } catch (error) {
      lastError = error

      if (isGeminiAccessDeniedError(error)) {
        break
      }

      if (hasFallback) {
        console.warn(
          `[ai-tutor] Gemini stream failed for ${modelName}, trying fallback model`
        )
        continue
      }

      break
    }
  }

  throw new Error(toGeminiUserError(lastError))
}
