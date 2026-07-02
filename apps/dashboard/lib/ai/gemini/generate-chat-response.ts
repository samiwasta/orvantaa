import { messageHasImageContent } from "../attachments/build-multimodal-content"
import { AI_TUTOR_SYSTEM_PROMPT } from "../prompts"
import type { AiChatMessage, AiChatOptions, AiContentPart } from "../types"
import { getGeminiConfig, getGeminiModelCandidates } from "./config"
import {
  assertGeminiConfigured,
  isGeminiAccessDeniedError,
  isGeminiQuotaError,
  parseGeminiRetryDelayMs,
  sleep,
  toGeminiUserError,
} from "./errors"

export type GeminiChatMessage = AiChatMessage

type GeminiContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiContentPart[]
    }
  }>
  error?: {
    code?: number
    message?: string
    status?: string
  }
}

function toGeminiParts(content: string | AiContentPart[]): GeminiContentPart[] {
  if (typeof content === "string") {
    return [{ text: content }]
  }

  const parts: GeminiContentPart[] = []
  for (const part of content) {
    if (part.type === "text") {
      parts.push({ text: part.text })
      continue
    }

    const match = part.image_url.url.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) continue

    parts.push({
      inlineData: {
        mimeType: match[1]!,
        data: match[2]!,
      },
    })
  }

  return parts
}

function buildContents(messages: GeminiChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: toGeminiParts(message.content),
  }))
}

function messagesUseVision(messages: GeminiChatMessage[]): boolean {
  return messages.some(
    (message) =>
      message.role === "user" && messageHasImageContent(message.content)
  )
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  messages: GeminiChatMessage[],
  systemPrompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: buildContents(messages),
    }),
  })

  const payload = (await response
    .json()
    .catch(() => null)) as GeminiGenerateContentResponse | null

  if (!response.ok) {
    const apiMessage =
      payload?.error?.message ??
      `Gemini request failed with status ${response.status}.`
    throw new Error(`[${response.status}] ${apiMessage}`)
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => ("text" in part ? (part.text ?? "") : ""))
    .join("")
    .trim()

  if (!text) {
    throw new Error("Gemini returned an empty response.")
  }

  return text
}

export async function generateGeminiChatResponse(
  messages: GeminiChatMessage[],
  options?: AiChatOptions
): Promise<string> {
  assertGeminiConfigured()

  if (messages.length === 0) {
    throw new Error("At least one message is required.")
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role !== "user") {
    throw new Error("The last message must be from the user.")
  }

  const config = getGeminiConfig()
  const models = getGeminiModelCandidates(config)
  const systemPrompt = options?.systemPrompt ?? AI_TUTOR_SYSTEM_PROMPT
  const usesVision = messagesUseVision(messages)
  const candidateModels = usesVision
    ? models.filter((model) => !model.includes("embedding"))
    : models
  let lastError: unknown = null

  for (let index = 0; index < candidateModels.length; index += 1) {
    const modelName = candidateModels[index]!
    const hasFallback = index < candidateModels.length - 1

    try {
      return await generateWithModel(
        config.apiKey,
        modelName,
        messages,
        systemPrompt
      )
    } catch (error) {
      lastError = error

      if (isGeminiAccessDeniedError(error)) {
        break
      }

      if (isGeminiQuotaError(error)) {
        const retryDelayMs = parseGeminiRetryDelayMs(error)
        if (retryDelayMs && retryDelayMs <= 15_000) {
          await sleep(retryDelayMs)
          try {
            return await generateWithModel(
              config.apiKey,
              modelName,
              messages,
              systemPrompt
            )
          } catch (retryError) {
            lastError = retryError
            if (
              isGeminiAccessDeniedError(retryError) ||
              (!isGeminiQuotaError(retryError) && !hasFallback)
            ) {
              break
            }
          }
        }

        if (hasFallback) {
          console.warn(
            `[ai-tutor] Gemini quota hit for ${modelName}, trying fallback model`
          )
          continue
        }
      }

      if (hasFallback) {
        console.warn(
          `[ai-tutor] Gemini request failed for ${modelName}, trying fallback model`
        )
        continue
      }

      break
    }
  }

  throw new Error(toGeminiUserError(lastError))
}
