import {
  attachmentKindForMime,
  CHAT_ALLOWED_MIME_TYPES,
  CHAT_ATTACHMENT_MAX_BYTES,
  CHAT_ATTACHMENT_MAX_FILENAME_LENGTH,
  CHAT_ATTACHMENT_MAX_FILES,
  type ChatAttachmentMimeType,
  sanitizeAttachmentFilename,
} from "../model/chat-attachments"

const EXTENSION_MIME_MAP: Record<string, ChatAttachmentMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  pdf: "application/pdf",
}

const BLOCKED_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "com",
  "msi",
  "sh",
  "bash",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "html",
  "htm",
  "svg",
  "zip",
  "rar",
  "7z",
  "dmg",
  "app",
  "php",
  "py",
  "rb",
  "jar",
])

export function resolveAttachmentMimeType(
  file: File
): ChatAttachmentMimeType | null {
  const normalizedType = file.type.trim().toLowerCase()
  if (
    CHAT_ALLOWED_MIME_TYPES.includes(normalizedType as ChatAttachmentMimeType)
  ) {
    return normalizedType as ChatAttachmentMimeType
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  return EXTENSION_MIME_MAP[extension] ?? null
}

export function validateChatAttachmentFile(
  file: File,
  existingCount: number
): string | null {
  if (existingCount >= CHAT_ATTACHMENT_MAX_FILES) {
    return `You can attach up to ${CHAT_ATTACHMENT_MAX_FILES} files.`
  }

  if (file.size <= 0) {
    return "Empty files cannot be attached."
  }

  if (file.size > CHAT_ATTACHMENT_MAX_BYTES) {
    return `"${sanitizeAttachmentFilename(file.name)}" exceeds the 10 MB limit.`
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (BLOCKED_EXTENSIONS.has(extension)) {
    return `"${sanitizeAttachmentFilename(file.name)}" is not an allowed file type.`
  }

  const mimeType = resolveAttachmentMimeType(file)
  if (!mimeType) {
    return `"${sanitizeAttachmentFilename(file.name)}" must be an image or text document (PDF, TXT, MD, CSV, JSON).`
  }

  if (
    sanitizeAttachmentFilename(file.name).length >
    CHAT_ATTACHMENT_MAX_FILENAME_LENGTH
  ) {
    return "Filename is too long."
  }

  void attachmentKindForMime(mimeType)
  return null
}
