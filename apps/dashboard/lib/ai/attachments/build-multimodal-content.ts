import type { ProcessedChatAttachment } from "@/features/ai-tutor/model/chat-attachments"

import type { AiContentPart } from "../types"
import { buildAttachmentAugmentedUserContent } from "./process-chat-attachments"

export function buildMultimodalUserContent(
  text: string,
  attachments: ProcessedChatAttachment[]
): string | AiContentPart[] {
  const imageAttachments = attachments.filter(
    (attachment) => attachment.kind === "image" && attachment.imageDataUrl
  )

  if (imageAttachments.length === 0) {
    return buildAttachmentAugmentedUserContent(text, attachments)
  }

  const parts: AiContentPart[] = []
  const textContent = buildAttachmentAugmentedUserContent(text, attachments)

  if (textContent.trim()) {
    parts.push({ type: "text", text: textContent })
  }

  for (const attachment of imageAttachments) {
    if (!attachment.imageDataUrl) continue
    parts.push({
      type: "image_url",
      image_url: { url: attachment.imageDataUrl },
    })
  }

  return parts
}

export function messageHasImageContent(
  content: string | AiContentPart[]
): boolean {
  if (typeof content === "string") return false
  return content.some((part) => part.type === "image_url")
}

export function flattenMessageContent(
  content: string | AiContentPart[]
): string {
  if (typeof content === "string") return content
  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim()
}
