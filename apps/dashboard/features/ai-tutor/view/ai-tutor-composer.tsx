"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowUp, Plus } from "lucide-react"
import { useRef, useState } from "react"

import type { UserMessageAttachmentPreview } from "../model/chat-attachments"
import { CHAT_ATTACHMENT_MAX_FILES } from "../model/chat-attachments"
import { ChatAttachmentPreviews } from "./chat-attachment-previews"
import { DictationMicButton } from "./dictation-mic-button"

const ACCEPTED_FILE_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,.pdf,.txt,.md,.csv,.json,application/pdf,text/plain,text/markdown,text/csv,application/json"

type AiTutorComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  sendDisabled?: boolean
  isListening?: boolean
  dictationSupported?: boolean
  onToggleDictation?: () => void
  onStopDictation?: () => void
  dictationError?: string | null
  attachments: UserMessageAttachmentPreview[]
  attachmentError?: string | null
  isPreparingAttachments?: boolean
  onAddFiles: (files: FileList | File[]) => void
  onRemoveAttachment: (id: string) => void
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  maxTextareaHeight?: number
  compact?: boolean
  variant?: "default" | "premium"
  sendIcon?: React.ReactNode
  className?: string
  footerText?: string
}

export function AiTutorComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  disabled,
  sendDisabled,
  isListening,
  dictationSupported,
  onToggleDictation,
  dictationError,
  attachments,
  attachmentError,
  isPreparingAttachments,
  onAddFiles,
  onRemoveAttachment,
  textareaRef,
  onKeyDown,
  maxTextareaHeight = 12 * 21 + 24,
  compact,
  variant = "default",
  sendIcon,
  className,
  footerText,
}: AiTutorComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragDepthRef = useRef(0)

  const isPremium = variant === "premium"

  const canSend =
    !sendDisabled &&
    !disabled &&
    !isPreparingAttachments &&
    (value.trim().length > 0 || attachments.length > 0)

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepthRef.current += 1
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepthRef.current -= 1
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0
      setIsDragging(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepthRef.current = 0
    setIsDragging(false)
    if (disabled || isPreparingAttachments) return
    if (event.dataTransfer.files?.length) {
      onAddFiles(event.dataTransfer.files)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSubmit()
      }}
      className={className}
    >
      {attachmentError || dictationError ? (
        <p
          className={cn(
            "mb-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs text-rose-700",
            compact && "mb-2.5 text-left"
          )}
          role="alert"
        >
          {attachmentError ?? dictationError}
        </p>
      ) : null}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative transition-all",
          isPremium
            ? "rounded-[2rem] border border-white/70 bg-white/82 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_6px_20px_rgba(15,23,42,0.04)] backdrop-blur-lg focus-within:border-white/85 focus-within:bg-white/88 focus-within:shadow-[0_2px_4px_rgba(0,0,0,0.03),0_10px_28px_rgba(15,23,42,0.06)]"
            : cn(
                "rounded-[1.75rem] border bg-white",
                compact
                  ? "rounded-xl border-border/70 bg-[#faf9fc] shadow-sm focus-within:border-violet-200 focus-within:ring-2 focus-within:ring-violet-100"
                  : "border-border/60 shadow-[0_2px_16px_-8px_rgba(15,15,40,0.18)] focus-within:border-[#6C5CE7]/50 focus-within:shadow-[0_4px_24px_-8px_rgba(108,92,231,0.3)]"
              ),
          isDragging &&
            (isPremium
              ? "border-[#6C5CE7]/40 ring-2 ring-[#6C5CE7]/10"
              : "border-[#6C5CE7]/60 ring-2 ring-[#6C5CE7]/15")
        )}
      >
        {isDragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-violet-50/90 backdrop-blur-[1px]">
            <p className="text-sm font-medium text-[#5d4ed6]">
              Drop up to {CHAT_ATTACHMENT_MAX_FILES} files (10 MB each)
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-col",
            isPremium ? "gap-2.5 p-3" : compact ? "gap-2 p-2" : "gap-2.5 p-2.5"
          )}
        >
          {attachments.length > 0 ? (
            <ChatAttachmentPreviews
              attachments={attachments}
              onRemove={onRemoveAttachment}
              disabled={disabled || isPreparingAttachments}
              compact={compact}
            />
          ) : null}

          <div
            className={cn(
              "flex items-center gap-2",
              isPremium ? "min-h-10" : compact ? "min-h-8" : "min-h-9"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              className="sr-only"
              disabled={disabled || isPreparingAttachments}
              onChange={(event) => {
                if (event.target.files?.length) {
                  onAddFiles(event.target.files)
                }
                event.target.value = ""
              }}
            />

            <button
              type="button"
              disabled={
                disabled ||
                isPreparingAttachments ||
                attachments.length >= CHAT_ATTACHMENT_MAX_FILES
              }
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground disabled:opacity-40",
                isPremium
                  ? "size-10"
                  : "size-9 hover:bg-violet-50 hover:text-[#6C5CE7]",
                compact && !isPremium && "size-8 rounded-lg"
              )}
              aria-label="Attach images or documents"
              title="Attach images or documents"
            >
              {isPremium ? (
                <Plus className="size-5" strokeWidth={1.75} />
              ) : (
                <Plus
                  className={compact ? "size-4" : "size-[18px]"}
                  strokeWidth={2}
                />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isListening ? "Listening..." : placeholder}
              rows={1}
              disabled={disabled}
              style={{
                maxHeight: maxTextareaHeight,
                overflowY:
                  value.includes("\n") || value.length > 100
                    ? "auto"
                    : "hidden",
              }}
              className={cn(
                "block max-h-[inherit] flex-1 resize-none border-0 bg-transparent p-0 outline-none placeholder:text-muted-foreground/45",
                isPremium
                  ? "h-6 min-h-6 text-base leading-6 font-light tracking-[-0.01em] text-foreground"
                  : compact
                    ? "h-5 min-h-5 text-[13px] leading-5 text-foreground placeholder:text-muted-foreground/50"
                    : "h-[22px] min-h-[22px] text-[15px] leading-[22px] text-foreground placeholder:text-muted-foreground/50"
              )}
            />

            {onToggleDictation ? (
              <DictationMicButton
                isListening={Boolean(isListening)}
                isSupported={Boolean(dictationSupported)}
                disabled={Boolean(disabled)}
                className={cn(
                  isPremium
                    ? "size-10 hover:bg-black/[0.04] hover:text-foreground"
                    : undefined,
                  isPremium && isListening && "hover:bg-rose-50"
                )}
                onClick={onToggleDictation}
              />
            ) : null}

            {!isPremium || canSend ? (
              <Button
                type="submit"
                size="icon"
                disabled={!canSend}
                className={cn(
                  "shrink-0 transition-all disabled:opacity-60 disabled:shadow-none",
                  isPremium
                    ? "size-10 rounded-full bg-foreground text-background shadow-none hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
                    : "size-9 rounded-full bg-[#6C5CE7] text-white shadow-sm hover:bg-[#5d4ed6] disabled:bg-muted disabled:text-muted-foreground",
                  compact && !isPremium && "rounded-lg"
                )}
                aria-label="Send message"
              >
                {sendIcon ?? (
                  <ArrowUp
                    className={isPremium ? "size-[18px]" : "size-5"}
                    strokeWidth={isPremium ? 2 : 2.25}
                    aria-hidden
                  />
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {footerText && !isPremium ? (
        <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
          {footerText}
        </p>
      ) : null}
    </form>
  )
}
