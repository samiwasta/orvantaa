import { getGeminiConfig } from "./config"

export type GeminiApiKeyKind = "legacy" | "aq" | "unknown"

export function detectGeminiApiKeyKind(apiKey: string): GeminiApiKeyKind {
  const trimmed = apiKey.trim()
  if (trimmed.startsWith("AIza")) return "legacy"
  if (trimmed.startsWith("AQ.")) return "aq"
  return "unknown"
}

export function validateGeminiApiKey(apiKey: string): string | null {
  const trimmed = apiKey.trim()
  if (!trimmed) {
    return "GEMINI_API_KEY is missing."
  }

  if (trimmed.length < 20) {
    return "GEMINI_API_KEY looks too short. Create a new key in Google AI Studio."
  }

  const kind = detectGeminiApiKeyKind(trimmed)
  if (kind === "legacy" || kind === "aq") {
    return null
  }

  return "GEMINI_API_KEY format is not recognized. Create a key at https://aistudio.google.com/apikey."
}

export function isGeminiAccessDeniedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  return (
    normalized.includes("403") ||
    normalized.includes("permission_denied") ||
    normalized.includes("denied access") ||
    normalized.includes("does not have permission")
  )
}

export function isGeminiQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  return (
    normalized.includes("429") ||
    normalized.includes("quota") ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("rate limit") ||
    normalized.includes("limit: 0")
  )
}

export function isGeminiAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  return (
    normalized.includes("401") ||
    normalized.includes("400") ||
    normalized.includes("api_key_invalid") ||
    normalized.includes("invalid authentication") ||
    normalized.includes("multiple authentication credentials")
  )
}

export function parseGeminiRetryDelayMs(error: unknown): number | null {
  const message = error instanceof Error ? error.message : String(error)
  const match = message.match(/retry in (\d+(?:\.\d+)?)s/i)
  if (!match?.[1]) return null

  const seconds = Number.parseFloat(match[1])
  if (!Number.isFinite(seconds) || seconds <= 0) return null

  return Math.ceil(seconds * 1000)
}

export function assertGeminiConfigured(): void {
  const config = getGeminiConfig()
  if (!config.enabled) {
    throw new Error(
      "AI Tutor is not configured. Add GEMINI_API_KEY to enable Gemini."
    )
  }

  const keyError = validateGeminiApiKey(config.apiKey)
  if (keyError) {
    throw new Error(keyError)
  }
}

export function toGeminiUserError(error: unknown): string {
  if (error instanceof Error && error.message.startsWith("AI Tutor")) {
    return error.message
  }

  if (isGeminiAccessDeniedError(error)) {
    return "AI Tutor cannot access Gemini for this Google Cloud project. In Google AI Studio, open your API key project (Orvantaa) and click Activate billing on the Billing tier column. Resolve any project issues shown at the top of AI Studio, then restart the dashboard server."
  }

  if (isGeminiQuotaError(error)) {
    return "AI Tutor is temporarily unavailable due to Gemini API quota limits. Please try again in a minute, or switch GEMINI_MODEL to gemini-2.5-flash-lite."
  }

  if (isGeminiAuthError(error)) {
    return "Gemini rejected the API key. Copy the key again from Google AI Studio and update GEMINI_API_KEY in apps/dashboard/.env."
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return "Could not generate a response. Please try again."
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
