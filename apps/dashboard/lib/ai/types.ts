export type AiChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type AiChatOptions = {
  systemPrompt?: string
  maxTokens?: number
}
