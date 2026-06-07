import { getAiTutorProvider } from "./config"
import { streamGeminiChatResponse } from "./gemini/stream-chat-response"
import { streamGroqChatResponse } from "./groq/stream-chat-response"
import type { AiChatMessage } from "./types"

export async function* streamAiTutorChatResponse(
  messages: AiChatMessage[]
): AsyncGenerator<string> {
  const provider = getAiTutorProvider()

  if (provider === "groq") {
    yield* streamGroqChatResponse(messages)
    return
  }

  if (provider === "gemini") {
    yield* streamGeminiChatResponse(messages)
    return
  }

  throw new Error(
    "AI Tutor is not configured. Add GROQ_API_KEY (free) or GEMINI_API_KEY."
  )
}
