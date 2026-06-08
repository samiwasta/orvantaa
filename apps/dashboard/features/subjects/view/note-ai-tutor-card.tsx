"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Loader2, SendHorizontal, Sparkles, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

import { requestAiTutorReply } from "@/features/ai-tutor/service/ai-tutor-chat.service"
import { AiTutorMarkdown } from "@/features/ai-tutor/view/ai-tutor-markdown"

import type { AiTutorWidgetScope } from "../model/ai-tutor-scope"

const MAX_INPUT_ROWS = 3

const noteQuickPrompts = [
  "Explain this concept",
  "Solve a similar problem",
  "Give me practice questions",
] as const

const quizQuickPrompts = [
  "Explain the concept behind this",
  "Give me a hint",
  "What should I think about first?",
] as const

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type NoteAiTutorCardProps = {
  scope: AiTutorWidgetScope
  onClose?: () => void
  className?: string
}

function TutorAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20",
        className
      )}
      aria-hidden
    >
      <Image
        src="/robot.svg"
        alt=""
        width={20}
        height={20}
        className="size-4 object-contain"
      />
    </span>
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1" aria-label="AI Tutor is typing">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 animate-bounce rounded-full bg-[#6C5CE7]/70"
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
    </span>
  )
}

export function NoteAiTutorCard({
  scope,
  onClose,
  className,
}: NoteAiTutorCardProps) {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts =
    scope.mode === "quiz" ? quizQuickPrompts : noteQuickPrompts
  const isEmpty = messages.length === 0

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

  useEffect(() => {
    setMessages([])
    setQuery("")
    setError(null)
  }, [scope.title, scope.mode, scope.content])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isLoading])

  const submitMessage = async (rawMessage: string) => {
    const trimmed = rawMessage.trim()
    if (!trimmed || isLoading) return

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ]

    setQuery("")
    setError(null)
    setMessages(nextMessages)
    setIsLoading(true)

    try {
      const { content } = await requestAiTutorReply(nextMessages, scope)
      setMessages([...nextMessages, { role: "assistant", content }])
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Could not get a response right now."
      setError(message)
      setMessages(nextMessages)
    } finally {
      setIsLoading(false)
      requestAnimationFrame(adjustTextareaHeight)
    }
  }

  const emptyHeadline =
    scope.mode === "quiz" ? "Stuck on this question?" : "Ask about this lesson"
  const emptyDescription =
    scope.mode === "quiz"
      ? "I'll explain the idea and nudge you with hints — not the direct answer."
      : "Short, clear answers tailored to this lesson."

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl bg-linear-to-b from-[#211d57] via-[#1b1850] to-[#141137] text-white shadow-[0_24px_48px_-20px_rgba(15,12,45,0.95)] ring-1 ring-white/10",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -top-8 -left-8 size-32 rounded-full bg-[#7f54ee]/25 blur-3xl"
        aria-hidden
      />

      <header className="relative flex shrink-0 items-center gap-2.5 border-b border-white/10 px-3.5 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#8b6cf6] to-[#6447dd] shadow-[0_8px_18px_-12px_rgba(127,84,238,0.95)]">
          <Image
            src="/robot.svg"
            alt=""
            width={22}
            height={22}
            className="size-5 object-contain"
            aria-hidden
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1 text-sm font-semibold tracking-tight text-white">
            AI Tutor
            <Sparkles
              className="size-3 text-amber-300"
              strokeWidth={2.5}
              aria-hidden
            />
          </h2>
          <p className="truncate text-[11px] text-white/55">{scope.title}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close AI Tutor"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-1 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Image
                src="/sparkle.svg"
                alt=""
                width={24}
                height={24}
                className="size-5 object-contain"
                aria-hidden
              />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-white">
              {emptyHeadline}
            </h3>
            <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-white/65">
              {emptyDescription}
            </p>

            <div className="mt-4 flex w-full flex-col gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void submitMessage(prompt)}
                  className="rounded-xl bg-white/8 px-3 py-2.5 text-left text-xs font-medium text-white/90 ring-1 ring-white/12 transition-all hover:bg-white/15 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex items-end gap-1.5",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" ? <TutorAvatar /> : null}
                <div
                  className={cn(
                    "max-w-[85%] px-3 py-2 text-[13px] leading-5 shadow-sm",
                    message.role === "user"
                      ? "rounded-2xl rounded-br-md bg-linear-to-br from-[#8b6cf6] to-[#6447dd] text-white"
                      : "rounded-2xl rounded-bl-md bg-white text-[#1f2937]"
                  )}
                >
                  {message.role === "assistant" ? (
                    <AiTutorMarkdown
                      content={message.content}
                      variant="compact"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex items-end gap-1.5">
                <TutorAvatar />
                <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="relative shrink-0 border-t border-white/10 px-3.5 py-3">
        {error ? (
          <p
            className="mb-2 rounded-lg bg-rose-500/15 px-2.5 py-1.5 text-[11px] text-rose-200 ring-1 ring-rose-400/25"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {!isEmpty ? (
          <div className="mb-2 flex flex-wrap gap-1">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => void submitMessage(prompt)}
                className="rounded-full bg-white/8 px-2.5 py-0.5 text-[10px] font-medium text-white/80 ring-1 ring-white/12 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="flex items-end gap-1.5 rounded-xl bg-white p-1 pl-2.5 shadow-[0_10px_24px_-18px_rgba(8,10,30,0.9)]"
          onSubmit={(event) => {
            event.preventDefault()
            void submitMessage(query)
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onInput={adjustTextareaHeight}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void submitMessage(query)
              }
            }}
            placeholder={
              scope.mode === "quiz"
                ? "Ask for a hint..."
                : "Ask about this lesson..."
            }
            disabled={isLoading}
            className={cn(
              "min-h-8 min-w-0 flex-1 resize-none self-center border-0 bg-transparent py-1.5",
              "text-[13px] leading-5 text-[#1f2937] shadow-none outline-none",
              "placeholder:text-[#9ca3af] focus-visible:ring-0 disabled:opacity-60"
            )}
            aria-label={`Ask about ${scope.title}`}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!query.trim() || isLoading}
            className="size-8 shrink-0 rounded-lg bg-linear-to-br from-[#8b6cf6] to-[#6447dd] text-white hover:from-[#7f5cf0] hover:to-[#5a3fd0] disabled:opacity-40"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <SendHorizontal className="size-3.5" aria-hidden />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
