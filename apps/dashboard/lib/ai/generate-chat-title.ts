import { titleFromFirstMessage } from "@/features/ai-tutor/model/chat-data"

import { getAiTutorProvider } from "./config"
import { generateGeminiChatTitle } from "./gemini/generate-chat-title"
import { generateGroqChatTitle } from "./groq/generate-chat-title"

export async function generateAiTutorChatTitle(
  firstUserMessage: string
): Promise<string> {
  const fallbackTitle = titleFromFirstMessage(firstUserMessage)
  const provider = getAiTutorProvider()

  if (provider === "groq") {
    return generateGroqChatTitle(firstUserMessage, fallbackTitle)
  }

  if (provider === "gemini") {
    try {
      return await generateGeminiChatTitle(firstUserMessage, fallbackTitle)
    } catch {
      return fallbackTitle
    }
  }

  return fallbackTitle
}
