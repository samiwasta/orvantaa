"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState } from "react"

import { markdownToPlainText } from "../model/markdown-to-plain-text"
import type { MessageFeedback } from "../model/message-feedback"

export type { MessageFeedback }

type AssistantMessageActionsProps = {
  content: string
  feedback: MessageFeedback
  canRetry: boolean
  disabled?: boolean
  onFeedback: (feedback: MessageFeedback) => void
  onRetry: () => void
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          className={cn(
            "size-8 rounded-lg text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            className
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export function AssistantMessageActions({
  content,
  feedback,
  canRetry,
  disabled = false,
  onFeedback,
  onRetry,
}: AssistantMessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownToPlainText(content))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleLike = () => {
    onFeedback(feedback === "like" ? null : "like")
  }

  const handleDislike = () => {
    onFeedback(feedback === "dislike" ? null : "dislike")
  }

  return (
    <div className="mt-3 flex items-center gap-0.5">
      <ActionButton
        label={copied ? "Copied" : "Copy response"}
        onClick={() => void handleCopy()}
        disabled={disabled}
        className={
          copied ? "text-emerald-600 hover:text-emerald-600" : undefined
        }
      >
        {copied ? (
          <Check className="size-4" strokeWidth={2} />
        ) : (
          <Copy className="size-4" strokeWidth={2} />
        )}
      </ActionButton>

      <ActionButton
        label="Good response"
        onClick={handleLike}
        disabled={disabled}
        className={
          feedback === "like"
            ? "text-[#4169E1] hover:bg-[#4169E1]/10 hover:text-[#4169E1]"
            : undefined
        }
      >
        <ThumbsUp
          className="size-4"
          strokeWidth={2}
          fill={feedback === "like" ? "currentColor" : "none"}
        />
      </ActionButton>

      <ActionButton
        label="Bad response"
        onClick={handleDislike}
        disabled={disabled}
        className={
          feedback === "dislike"
            ? "text-rose-600 hover:bg-rose-50 hover:text-rose-600"
            : undefined
        }
      >
        <ThumbsDown
          className="size-4"
          strokeWidth={2}
          fill={feedback === "dislike" ? "currentColor" : "none"}
        />
      </ActionButton>

      {canRetry ? (
        <ActionButton
          label="Retry response"
          onClick={onRetry}
          disabled={disabled}
        >
          <RotateCcw className="size-4" strokeWidth={2} />
        </ActionButton>
      ) : null}
    </div>
  )
}
