export type GroqConfig = {
  apiKey: string
  model: string
  enabled: boolean
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile"

export function getGroqConfig(): GroqConfig {
  const apiKey = process.env.GROQ_API_KEY?.trim() ?? ""
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL
  const explicitEnabled = process.env.GROQ_ENABLED?.trim().toLowerCase()

  const enabled =
    explicitEnabled === "true"
      ? Boolean(apiKey)
      : explicitEnabled === "false"
        ? false
        : Boolean(apiKey)

  return { apiKey, model, enabled }
}

export function isGroqConfigured(): boolean {
  return getGroqConfig().enabled
}
