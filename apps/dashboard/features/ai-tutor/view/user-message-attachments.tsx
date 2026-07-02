"use client"

import { cn } from "@workspace/ui/lib/utils"
import { FileText, ImageIcon } from "lucide-react"
import { useState } from "react"

import type { ChatMessageAttachment } from "../model/chat-data"

type UserMessageAttachmentsProps = {
  attachments?: ChatMessageAttachment[]
  compact?: boolean
}

function AttachmentImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded bg-white/10">
        <ImageIcon className="size-3.5 text-white/90" />
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="size-7 shrink-0 rounded object-cover"
    />
  )
}

export function UserMessageAttachments({
  attachments,
  compact,
}: UserMessageAttachmentsProps) {
  if (!attachments?.length) return null

  return (
    <div
      className={cn(
        "mb-2 flex flex-wrap gap-1.5",
        compact ? "justify-end" : "justify-end"
      )}
    >
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={cn(
            "flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 ring-1 ring-white/20",
            compact && "max-w-[8.5rem]"
          )}
        >
          {attachment.kind === "image" ? (
            attachment.previewUrl ? (
              <AttachmentImage src={attachment.previewUrl} />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded bg-white/10">
                <ImageIcon className="size-3.5 text-white/90" />
              </span>
            )
          ) : (
            <FileText className="size-3.5 shrink-0 text-white/90" />
          )}
          <span
            className={cn(
              "truncate text-[11px] text-white/90",
              compact ? "max-w-[5.5rem]" : "max-w-[7rem]"
            )}
            title={attachment.name}
          >
            {attachment.name}
          </span>
        </div>
      ))}
    </div>
  )
}
