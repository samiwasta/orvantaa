export type AiTextContentPart = {
  type: "text"
  text: string
}

export type AiImageContentPart = {
  type: "image_url"
  image_url: {
    url: string
  }
}

export type AiContentPart = AiTextContentPart | AiImageContentPart

export type AiChatMessage = {
  role: "user" | "assistant"
  content: string | AiContentPart[]
}

export type AiChatOptions = {
  systemPrompt?: string
  maxTokens?: number
}
