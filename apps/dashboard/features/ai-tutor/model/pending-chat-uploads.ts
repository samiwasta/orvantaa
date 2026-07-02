const pendingUploadsByChatId = new Map<string, File[]>()

export function stashChatUploads(chatId: string, files: File[]): void {
  if (files.length === 0) {
    pendingUploadsByChatId.delete(chatId)
    return
  }

  pendingUploadsByChatId.set(chatId, files)
}

export function takeChatUploads(chatId: string): File[] {
  const files = pendingUploadsByChatId.get(chatId) ?? []
  pendingUploadsByChatId.delete(chatId)
  return files
}
