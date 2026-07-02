"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { prepareChatImageFile } from "../lib/prepare-chat-image"
import {
  resolveAttachmentMimeType,
  validateChatAttachmentFile,
} from "../lib/validate-chat-attachment"
import {
  attachmentKindForMime,
  type ClientChatAttachment,
  type UserMessageAttachmentPreview,
} from "../model/chat-attachments"

function createAttachmentId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useChatAttachments() {
  const [attachments, setAttachments] = useState<ClientChatAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const attachmentsRef = useRef(attachments)

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  useEffect(() => {
    return () => {
      for (const attachment of attachmentsRef.current) {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl)
        }
      }
    }
  }, [])

  const revokePreview = useCallback((previewUrl: string | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [])

  const removeAttachment = useCallback(
    (id: string) => {
      setAttachments((current) => {
        const target = current.find((item) => item.id === id)
        revokePreview(target?.previewUrl ?? null)
        return current.filter((item) => item.id !== id)
      })
    },
    [revokePreview]
  )

  const clearAttachments = useCallback(
    (options?: { revokePreviews?: boolean }) => {
      const revokePreviews = options?.revokePreviews ?? true

      setAttachments((current) => {
        if (revokePreviews) {
          for (const attachment of current) {
            revokePreview(attachment.previewUrl)
          }
        }
        return []
      })
      setError(null)
    },
    [revokePreview]
  )

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const files = Array.from(incoming)
    if (files.length === 0) return

    setIsPreparing(true)
    setError(null)

    try {
      const next: ClientChatAttachment[] = [...attachmentsRef.current]

      for (const file of files) {
        const validationError = validateChatAttachmentFile(file, next.length)
        if (validationError) {
          setError(validationError)
          continue
        }

        const mimeType = resolveAttachmentMimeType(file)
        if (!mimeType) {
          setError(`"${file.name}" is not an allowed file type.`)
          continue
        }

        const kind = attachmentKindForMime(mimeType)
        let preparedFile: File | Blob = file

        if (kind === "image") {
          preparedFile = await prepareChatImageFile(file)
        }

        const blob = preparedFile instanceof File ? preparedFile : preparedFile
        const uploadFile =
          preparedFile instanceof File
            ? preparedFile
            : new File([preparedFile], file.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg",
              })

        const previewUrl = kind === "image" ? URL.createObjectURL(blob) : null

        next.push({
          id: createAttachmentId(),
          file: uploadFile,
          name: file.name,
          mimeType,
          kind,
          size: file.size,
          previewUrl,
        })
      }

      setAttachments(next)
    } finally {
      setIsPreparing(false)
    }
  }, [])

  const getUploadFiles = useCallback((): File[] => {
    return attachments.map((attachment) => attachment.file)
  }, [attachments])

  const getMessagePreviews = useCallback((): UserMessageAttachmentPreview[] => {
    return attachments.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      kind: attachment.kind,
      previewUrl: attachment.previewUrl,
    }))
  }, [attachments])

  return {
    attachments,
    error,
    isPreparing,
    addFiles,
    removeAttachment,
    clearAttachments,
    getUploadFiles,
    getMessagePreviews,
    setError,
  }
}
