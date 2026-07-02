export const CHAT_ATTACHMENT_MAX_FILES = 5
export const CHAT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024
export const CHAT_ATTACHMENT_MAX_TEXT_CHARS = 30_000
export const CHAT_ATTACHMENT_MAX_FILENAME_LENGTH = 180

export const CHAT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const

export const CHAT_DOCUMENT_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
] as const

export const CHAT_ALLOWED_MIME_TYPES = [
  ...CHAT_IMAGE_MIME_TYPES,
  ...CHAT_DOCUMENT_MIME_TYPES,
] as const

export type ChatAttachmentMimeType = (typeof CHAT_ALLOWED_MIME_TYPES)[number]

export type ChatAttachmentKind = "image" | "document"

export type ClientChatAttachment = {
  id: string
  file: File
  name: string
  mimeType: ChatAttachmentMimeType
  kind: ChatAttachmentKind
  size: number
  previewUrl: string | null
}

export type ChatAttachmentPayload = {
  name: string
  mimeType: ChatAttachmentMimeType
  kind: ChatAttachmentKind
  size: number
  dataBase64: string
}

export type ProcessedChatAttachment = {
  name: string
  mimeType: ChatAttachmentMimeType
  kind: ChatAttachmentKind
  size: number
  imageDataUrl?: string
  textContent?: string
}

export type UserMessageAttachmentPreview = {
  id: string
  name: string
  kind: ChatAttachmentKind
  previewUrl: string | null
}

export function isChatImageMimeType(
  mimeType: string
): mimeType is (typeof CHAT_IMAGE_MIME_TYPES)[number] {
  return CHAT_IMAGE_MIME_TYPES.includes(
    mimeType as (typeof CHAT_IMAGE_MIME_TYPES)[number]
  )
}

export function isChatDocumentMimeType(
  mimeType: string
): mimeType is (typeof CHAT_DOCUMENT_MIME_TYPES)[number] {
  return CHAT_DOCUMENT_MIME_TYPES.includes(
    mimeType as (typeof CHAT_DOCUMENT_MIME_TYPES)[number]
  )
}

export function attachmentKindForMime(mimeType: string): ChatAttachmentKind {
  return isChatImageMimeType(mimeType) ? "image" : "document"
}

export function sanitizeAttachmentFilename(name: string): string {
  const base = name.split(/[/\\]/).pop()?.trim() ?? "attachment"
  const cleaned = base
    .replace(/[^\w.\- ()[\]]+/g, "_")
    .slice(0, CHAT_ATTACHMENT_MAX_FILENAME_LENGTH)
  return cleaned || "attachment"
}
