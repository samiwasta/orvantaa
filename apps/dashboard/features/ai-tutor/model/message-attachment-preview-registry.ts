import type { ChatMessage } from "../model/chat-data"

const previewUrlByAttachmentId = new Map<string, string>()

export function registerMessageAttachmentPreview(
  attachmentId: string,
  previewUrl: string
): void {
  const existing = previewUrlByAttachmentId.get(attachmentId)
  if (existing && existing !== previewUrl) {
    URL.revokeObjectURL(existing)
  }
  previewUrlByAttachmentId.set(attachmentId, previewUrl)
}

export function releaseMessageAttachmentPreview(attachmentId: string): void {
  const previewUrl = previewUrlByAttachmentId.get(attachmentId)
  if (!previewUrl) return
  URL.revokeObjectURL(previewUrl)
  previewUrlByAttachmentId.delete(attachmentId)
}

export function hydrateMessageAttachmentPreviews(
  messages: ChatMessage[]
): ChatMessage[] {
  return messages.map((message) => ({
    ...message,
    attachments: message.attachments?.map((attachment) => ({
      ...attachment,
      previewUrl:
        attachment.kind === "image"
          ? (previewUrlByAttachmentId.get(attachment.id) ??
            attachment.previewUrl ??
            null)
          : null,
    })),
  }))
}

export function mergeMessageAttachmentPreviews(
  savedMessages: ChatMessage[],
  previousMessages: ChatMessage[]
): ChatMessage[] {
  const previewByAttachmentId = new Map<string, string>()

  for (const message of previousMessages) {
    for (const attachment of message.attachments ?? []) {
      if (attachment.kind === "image" && attachment.previewUrl) {
        previewByAttachmentId.set(attachment.id, attachment.previewUrl)
        registerMessageAttachmentPreview(attachment.id, attachment.previewUrl)
      }
    }
  }

  return hydrateMessageAttachmentPreviews(
    savedMessages.map((message) => ({
      ...message,
      attachments: message.attachments?.map((attachment) => ({
        ...attachment,
        previewUrl:
          attachment.kind === "image"
            ? (previewByAttachmentId.get(attachment.id) ?? null)
            : null,
      })),
    }))
  )
}
