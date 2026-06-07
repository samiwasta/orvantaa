import { isGeminiConfigured } from "./gemini/config"
import { isGroqConfigured } from "./groq/config"

export type AiTutorProvider = "groq" | "gemini"

export function getAiTutorProvider(): AiTutorProvider | null {
  const explicit = process.env.AI_TUTOR_PROVIDER?.trim().toLowerCase()

  if (explicit === "groq") {
    return isGroqConfigured() ? "groq" : null
  }

  if (explicit === "gemini") {
    return isGeminiConfigured() ? "gemini" : null
  }

  if (isGroqConfigured()) return "groq"
  if (isGeminiConfigured()) return "gemini"

  return null
}

export function isAiTutorConfigured(): boolean {
  return getAiTutorProvider() !== null
}

export function getAiTutorSetupHint(): string {
  const explicit = process.env.AI_TUTOR_PROVIDER?.trim().toLowerCase()

  if (explicit === "gemini") {
    return "Add GEMINI_API_KEY or switch AI_TUTOR_PROVIDER=groq with a free Groq key from https://console.groq.com/keys"
  }

  return "Add GROQ_API_KEY (free, no billing card) from https://console.groq.com/keys, or add GEMINI_API_KEY with billing enabled in Google AI Studio."
}
