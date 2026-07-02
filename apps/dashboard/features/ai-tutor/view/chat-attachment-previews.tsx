"use client"

import { cn } from "@workspace/ui/lib/utils"
import { FileText, X } from "lucide-react"

import type { UserMessageAttachmentPreview } from "../model/chat-attachments"

type ChatAttachmentPreviewsProps = {
  attachments: UserMessageAttachmentPreview[]
  onRemove: (id: string) => void
  disabled?: boolean
  compact?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ChatAttachmentPreviews({
  attachments,
  onRemove,
  disabled,
  compact,
}: ChatAttachmentPreviewsProps) {
  if (attachments.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={cn(
            "group relative flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30",
            compact ? "max-w-[9.5rem] px-2 py-1.5" : "max-w-[11rem] px-2.5 py-2"
          )}
        >
          {attachment.kind === "image" && attachment.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.previewUrl}
              alt=""
              className={cn(
                "shrink-0 rounded-lg object-cover ring-1 ring-black/5",
                compact ? "size-9" : "size-10"
              )}
            />
          ) : (
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[#6C5CE7]",
                compact ? "size-9" : "size-10"
              )}
            >
              <FileText className={compact ? "size-4" : "size-[18px]"} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-medium text-foreground",
                compact ? "text-[11px]" : "text-xs"
              )}
              title={attachment.name}
            >
              {attachment.name}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {attachment.kind}
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(attachment.id)}
            className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label={`Remove ${attachment.name}`}
          >
            <X className="size-3" strokeWidth={2.25} />
          </button>
        </div>
      ))}
    </div>
  )
}

export { formatFileSize }
