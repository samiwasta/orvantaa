export type GeminiConfig = {
  apiKey: string
  model: string
  fallbackModels: string[]
  enabled: boolean
}

const DEFAULT_MODEL = "gemini-2.5-flash"

const DEFAULT_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
] as const

function parseModelList(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
}

export function getGeminiModelCandidates(config?: {
  model?: string
  fallbackModels?: string[]
}): string[] {
  const primary = config?.model?.trim() || DEFAULT_MODEL
  const envFallbacks = parseModelList(process.env.GEMINI_FALLBACK_MODELS)
  const configuredFallbacks = config?.fallbackModels ?? envFallbacks

  const ordered = [primary, ...configuredFallbacks, ...DEFAULT_FALLBACK_MODELS]

  return [...new Set(ordered)]
}

export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY?.trim() ?? ""
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
  const fallbackModels = parseModelList(process.env.GEMINI_FALLBACK_MODELS)
  const explicitEnabled = process.env.GEMINI_ENABLED?.trim().toLowerCase()

  const enabled =
    explicitEnabled === "true"
      ? Boolean(apiKey)
      : explicitEnabled === "false"
        ? false
        : Boolean(apiKey)

  return {
    apiKey,
    model,
    fallbackModels,
    enabled,
  }
}

export function isGeminiConfigured(): boolean {
  return getGeminiConfig().enabled
}
