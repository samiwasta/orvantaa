import { getAiTutorProvider } from "./config"
import { generateGeminiChatResponse } from "./gemini/generate-chat-response"
import { generateGroqChatResponse } from "./groq/generate-chat-response"
import type { AiChatMessage, AiChatOptions } from "./types"

export type { AiChatMessage, AiChatOptions }

export async function generateAiTutorChatResponse(
  messages: AiChatMessage[],
  options?: AiChatOptions
): Promise<string> {
  const provider = getAiTutorProvider()

  if (provider === "groq") {
    return generateGroqChatResponse(messages, options)
  }

  if (provider === "gemini") {
    return generateGeminiChatResponse(messages, options)
  }

  throw new Error(
    "AI Tutor is not configured. Add GROQ_API_KEY (free) or GEMINI_API_KEY."
  )
}
