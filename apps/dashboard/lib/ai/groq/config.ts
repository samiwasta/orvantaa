export type GroqConfig = {
  apiKey: string
  model: string
  visionModel: string
  enabled: boolean
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile"
const DEFAULT_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

export function getGroqConfig(): GroqConfig {
  const apiKey = process.env.GROQ_API_KEY?.trim() ?? ""
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL
  const visionModel =
    process.env.GROQ_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL
  const explicitEnabled = process.env.GROQ_ENABLED?.trim().toLowerCase()

  const enabled =
    explicitEnabled === "true"
      ? Boolean(apiKey)
      : explicitEnabled === "false"
        ? false
        : Boolean(apiKey)

  return { apiKey, model, visionModel, enabled }
}

export function isGroqConfigured(): boolean {
  return getGroqConfig().enabled
}
