import {
  attachmentKindForMime,
  CHAT_ALLOWED_MIME_TYPES,
  CHAT_ATTACHMENT_MAX_BYTES,
  CHAT_ATTACHMENT_MAX_FILES,
  type ChatAttachmentMimeType,
  type ProcessedChatAttachment,
  sanitizeAttachmentFilename,
} from "@/features/ai-tutor/model/chat-attachments"

import { extractDocumentText } from "./extract-document-text"
import { detectMimeFromBuffer, mimeMatchesBuffer } from "./validate-magic-bytes"

const GROQ_MAX_IMAGE_BASE64_BYTES = 4 * 1024 * 1024

export async function processChatAttachments(
  files: File[]
): Promise<ProcessedChatAttachment[]> {
  if (files.length === 0) return []

  if (files.length > CHAT_ATTACHMENT_MAX_FILES) {
    throw new Error(`You can attach up to ${CHAT_ATTACHMENT_MAX_FILES} files.`)
  }

  const processed: ProcessedChatAttachment[] = []

  for (const file of files) {
    if (file.size <= 0) {
      throw new Error("Empty files cannot be attached.")
    }

    if (file.size > CHAT_ATTACHMENT_MAX_BYTES) {
      throw new Error(
        `"${sanitizeAttachmentFilename(file.name)}" exceeds the 10 MB limit.`
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = resolveServerMimeType(file, buffer)
    if (!mimeType) {
      throw new Error(
        `"${sanitizeAttachmentFilename(file.name)}" is not an allowed file type.`
      )
    }

    if (!mimeMatchesBuffer(buffer, mimeType)) {
      throw new Error(
        `"${sanitizeAttachmentFilename(file.name)}" does not match its file type.`
      )
    }

    const kind = attachmentKindForMime(mimeType)
    const name = sanitizeAttachmentFilename(file.name)

    if (kind === "image") {
      const base64 = buffer.toString("base64")
      if (base64.length > GROQ_MAX_IMAGE_BASE64_BYTES) {
        throw new Error(
          `"${name}" is too large to send after encoding. Try a smaller image.`
        )
      }

      processed.push({
        name,
        mimeType,
        kind,
        size: file.size,
        imageDataUrl: `data:${mimeType};base64,${base64}`,
      })
      continue
    }

    const textContent = await extractDocumentText(buffer, mimeType)
    processed.push({
      name,
      mimeType,
      kind,
      size: file.size,
      textContent,
    })
  }

  return processed
}

function resolveServerMimeType(
  file: File,
  buffer: Buffer
): ChatAttachmentMimeType | null {
  const normalized = file.type.trim().toLowerCase()
  if (CHAT_ALLOWED_MIME_TYPES.includes(normalized as ChatAttachmentMimeType)) {
    return normalized as ChatAttachmentMimeType
  }

  return detectMimeFromBuffer(buffer)
}

export function buildAttachmentAugmentedUserContent(
  text: string,
  attachments: ProcessedChatAttachment[]
): string {
  const sections: string[] = []

  if (text.trim()) {
    sections.push(text.trim())
  }

  for (const attachment of attachments) {
    if (attachment.kind === "document" && attachment.textContent) {
      sections.push(
        `[Attached document: ${attachment.name}]\n${attachment.textContent}`
      )
    }
  }

  if (
    sections.length === 0 &&
    attachments.some((item) => item.kind === "image")
  ) {
    sections.push("Please help me with the attached image(s).")
  }

  return sections.join("\n\n")
}

export function hasImageAttachments(
  attachments: ProcessedChatAttachment[]
): boolean {
  return attachments.some((attachment) => attachment.kind === "image")
}
