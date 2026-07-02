"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardDescription, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { SendHorizontal } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  aiTutorChatHref,
  NEW_CHAT_ID,
} from "@/features/ai-tutor/model/chat-data"
import { setPendingChatMessage } from "@/features/ai-tutor/model/pending-chat-message"
import { AiSparkleIcon } from "@/features/ai-tutor/view/ai-sparkle-icon"

type AiTutorPromptCardProps = {
  title?: string
  description?: string
  placeholder?: string
  className?: string
}

export function AiTutorPromptCard({
  title = "Ask AI Tutor",
  description = "Get help with any topic instantly",
  placeholder = "Ask anything...",
  className,
}: AiTutorPromptCardProps) {
  const router = useRouter()
  const [input, setInput] = useState("")

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setPendingChatMessage(trimmed)
    router.push(aiTutorChatHref(NEW_CHAT_ID))
  }

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl bg-linear-to-br from-[#232061] via-[#1f1b57] to-[#171446] p-0 text-white shadow-[0_24px_46px_-26px_rgba(31,27,87,0.98)] ring-0",
        className
      )}
    >
      <div className="pointer-events-none absolute top-8 -left-10 size-36 rounded-full bg-[#7f54ee]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 size-40 rounded-full bg-[#0ea5b7]/20 blur-3xl" />
      <div className="relative flex w-full flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Image
            src="/sparkle.svg"
            alt="Sparkle icon"
            width={28}
            height={28}
            className="size-6 object-contain drop-shadow-[0_6px_12px_rgba(255,200,90,0.35)] sm:size-7"
          />
          <CardTitle className="text-xl font-semibold tracking-tight text-white">
            {title}
          </CardTitle>
        </div>

        <CardDescription className="max-w-xl text-sm leading-relaxed text-white/90">
          {description}
        </CardDescription>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="mt-auto flex w-full items-center gap-2 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-[0_10px_24px_-16px_rgba(10,12,29,0.7)]"
        >
          <div className="pointer-events-none flex shrink-0 items-center pl-1">
            <AiSparkleIcon size={28} className="size-7 sm:size-8" />
          </div>
          <Input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-[#1f2937] shadow-none placeholder:text-[#6b7280] focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="size-10 shrink-0 rounded-xl bg-[#1f1b57] text-white shadow-[0_8px_16px_-10px_rgba(31,27,87,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#171446] disabled:opacity-50 disabled:hover:translate-y-0"
            aria-label="Send to AI Tutor"
          >
            <SendHorizontal className="size-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
