"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { SendHorizontal, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

const MAX_INPUT_ROWS = 4

const quickPrompts = [
  "Explain This Concept",
  "Solve A Similar Problem",
  "Give Me Practice Questions",
] as const

type NoteAiTutorCardProps = {
  lessonTitle: string
  onClose?: () => void
}

export function NoteAiTutorCard({
  lessonTitle,
  onClose,
}: NoteAiTutorCardProps) {
  const [query, setQuery] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return

    const style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight) || 20
    const paddingY =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const maxHeight = lineHeight * MAX_INPUT_ROWS + paddingY

    el.style.height = "auto"
    const nextHeight = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${nextHeight}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden"
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [query, adjustTextareaHeight])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#232061] via-[#1f1b57] to-[#171446] p-5 text-white shadow-[0_24px_46px_-26px_rgba(31,27,87,0.98)] sm:p-6">
      <div
        className="pointer-events-none absolute top-6 -left-8 size-32 rounded-full bg-[#7f54ee]/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 bottom-2 size-36 rounded-full bg-[#0ea5b7]/20 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-4">
        <div className="flex items-start gap-2">
          <Image
            src="/sparkle.svg"
            alt=""
            width={28}
            height={28}
            className="size-6 object-contain drop-shadow-[0_6px_12px_rgba(255,200,90,0.35)] sm:size-7"
            aria-hidden
          />
          <h2 className="flex-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
            Ask your AI Tutor
          </h2>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Close AI Tutor"
            >
              <X className="size-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-white/85">
          Stuck on this topic? Ask questions, get step-by-step explanations, or
          generate similar practice problems instantly.
        </p>

        <div className="flex items-start gap-2 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-[0_10px_24px_-16px_rgba(10,12,29,0.7)]">
          <div className="pointer-events-none flex shrink-0 pt-1 pl-1">
            <Image
              src="/robot.svg"
              alt=""
              width={32}
              height={32}
              className="size-7 object-contain sm:size-8"
              aria-hidden
            />
          </div>
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onInput={adjustTextareaHeight}
            placeholder="Ask about this lesson..."
            className={cn(
              "min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2",
              "text-sm leading-5 text-[#1f2937] shadow-none outline-none",
              "placeholder:text-[#6b7280] focus-visible:ring-0"
            )}
            aria-label={`Ask about ${lessonTitle}`}
          />
          <Button
            type="button"
            size="icon"
            className="mt-0.5 size-10 shrink-0 rounded-xl bg-[#1f1b57] text-white shadow-[0_8px_16px_-10px_rgba(31,27,87,0.95)] transition-all hover:bg-[#171446]"
            aria-label="Send message"
          >
            <SendHorizontal className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt)
                requestAnimationFrame(adjustTextareaHeight)
              }}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
