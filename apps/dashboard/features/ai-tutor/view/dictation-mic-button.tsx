"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Mic, MicOff } from "lucide-react"

type DictationMicButtonProps = {
  isListening: boolean
  isSupported: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}

export function DictationMicButton({
  isListening,
  isSupported,
  disabled = false,
  onClick,
  className,
}: DictationMicButtonProps) {
  if (!isSupported) return null

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "size-9 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-[#F0F4FF] hover:text-[#4169E1]",
        isListening &&
          "bg-rose-50 text-rose-600 ring-2 ring-rose-200/80 hover:bg-rose-50 hover:text-rose-600",
        className
      )}
      aria-label={isListening ? "Stop dictation" : "Dictate with microphone"}
      aria-pressed={isListening}
    >
      {isListening ? (
        <MicOff className="size-[18px]" strokeWidth={2.25} aria-hidden />
      ) : (
        <Mic className="size-[18px]" strokeWidth={2.25} aria-hidden />
      )}
    </Button>
  )
}
