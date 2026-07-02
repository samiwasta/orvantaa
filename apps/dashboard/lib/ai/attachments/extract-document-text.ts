import {
  CHAT_ATTACHMENT_MAX_TEXT_CHARS,
  type ChatAttachmentMimeType,
} from "@/features/ai-tutor/model/chat-attachments"

export async function extractDocumentText(
  buffer: Buffer,
  mimeType: ChatAttachmentMimeType
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractPdfText(buffer)
  }

  const text = buffer.toString("utf8").trim()
  if (!text) {
    throw new Error("Document appears to be empty.")
  }

  return truncateDocumentText(text)
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse")
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()

    const text = result.text?.trim() ?? ""
    if (!text) {
      throw new Error("Could not extract text from this PDF.")
    }
    return truncateDocumentText(text)
  } catch (error) {
    if (error instanceof Error && error.message.includes("Could not extract")) {
      throw error
    }
    throw new Error(
      "Could not read this PDF. Try a text-based PDF or attach a photo of the page."
    )
  }
}

function truncateDocumentText(text: string): string {
  if (text.length <= CHAT_ATTACHMENT_MAX_TEXT_CHARS) {
    return text
  }
  return `${text.slice(0, CHAT_ATTACHMENT_MAX_TEXT_CHARS)}\n\n[Document truncated for length.]`
}
