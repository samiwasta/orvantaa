import {
  CHAT_ALLOWED_MIME_TYPES,
  type ChatAttachmentMimeType,
} from "@/features/ai-tutor/model/chat-attachments"

function startsWithBytes(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false
  return bytes.every((byte, index) => buffer[index] === byte)
}

export function detectMimeFromBuffer(
  buffer: Buffer
): ChatAttachmentMimeType | null {
  if (startsWithBytes(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg"
  if (startsWithBytes(buffer, [0x89, 0x50, 0x4e, 0x47])) return "image/png"
  if (startsWithBytes(buffer, [0x47, 0x49, 0x46, 0x38])) return "image/gif"
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp"
  }
  if (buffer.subarray(0, 4).toString("ascii") === "%PDF") {
    return "application/pdf"
  }

  const asText = buffer.toString("utf8")
  if (asText.includes("\u0000")) {
    return null
  }

  if (looksLikeJson(asText)) return "application/json"
  if (looksLikeCsv(asText)) return "text/csv"
  if (looksLikeMarkdown(asText)) return "text/markdown"

  if (isMostlyPrintableText(asText)) {
    return "text/plain"
  }

  return null
}

function isMostlyPrintableText(value: string): boolean {
  if (!value.trim()) return false
  let printable = 0
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (
      code === 9 ||
      code === 10 ||
      code === 13 ||
      (code >= 32 && code !== 127)
    ) {
      printable += 1
    }
  }
  return printable / value.length >= 0.95
}

function looksLikeJson(value: string): boolean {
  const trimmed = value.trim()
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return false
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

function looksLikeCsv(value: string): boolean {
  const lines = value.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return false
  const commaLines = lines.filter((line) => line.includes(","))
  return commaLines.length >= Math.min(2, lines.length)
}

function looksLikeMarkdown(value: string): boolean {
  return /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|```)/.test(value)
}

export function mimeMatchesBuffer(
  buffer: Buffer,
  claimedMime: ChatAttachmentMimeType
): boolean {
  const detected = detectMimeFromBuffer(buffer)
  if (!detected) return false
  if (detected === claimedMime) return true

  if (
    claimedMime === "text/plain" &&
    (detected === "text/markdown" || detected === "text/csv")
  ) {
    return true
  }

  if (
    claimedMime === "text/markdown" &&
    (detected === "text/plain" || detected === "text/csv")
  ) {
    return true
  }

  if (
    claimedMime === "text/csv" &&
    (detected === "text/plain" || detected === "text/markdown")
  ) {
    return true
  }

  return CHAT_ALLOWED_MIME_TYPES.includes(detected) && detected === claimedMime
}
