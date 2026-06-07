import { getAiTutorProvider } from "./config"
import { generateGeminiChatResponse } from "./gemini/generate-chat-response"
import { generateGroqChatResponse } from "./groq/generate-chat-response"
import type { AiChatMessage } from "./types"

export type { AiChatMessage }

export async function generateAiTutorChatResponse(
  messages: AiChatMessage[]
): Promise<string> {
  const provider = getAiTutorProvider()

  if (provider === "groq") {
    return generateGroqChatResponse(messages)
  }

  if (provider === "gemini") {
    return generateGeminiChatResponse(messages)
  }

  throw new Error(
    "AI Tutor is not configured. Add GROQ_API_KEY (free) or GEMINI_API_KEY."
  )
}
