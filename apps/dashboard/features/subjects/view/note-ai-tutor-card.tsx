"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Loader2, SendHorizontal, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { useChatAttachments } from "@/features/ai-tutor/hooks/use-chat-attachments"
import { useSpeechDictation } from "@/features/ai-tutor/hooks/use-speech-dictation"
import type { ChatMessageAttachment } from "@/features/ai-tutor/model/chat-data"
import { registerMessageAttachmentPreview } from "@/features/ai-tutor/model/message-attachment-preview-registry"
import { requestAiTutorReply } from "@/features/ai-tutor/service/ai-tutor-chat.service"
import { AiTutorComposer } from "@/features/ai-tutor/view/ai-tutor-composer"
import { AiTutorMarkdown } from "@/features/ai-tutor/view/ai-tutor-markdown"
import { UserMessageAttachments } from "@/features/ai-tutor/view/user-message-attachments"

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
  attachments?: ChatMessageAttachment[]
}

type NoteAiTutorCardProps = {
  scope: AiTutorWidgetScope
  onClose?: () => void
  className?: string
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-0.5" aria-label="Typing">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 animate-bounce rounded-full bg-[#6C5CE7]/55"
          style={{ animationDelay: `${index * 140}ms` }}
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
  const [dictationError, setDictationError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    isListening,
    isSupported,
    toggle: toggleDictation,
    stop: stopDictation,
  } = useSpeechDictation({
    onError: setDictationError,
  })

  const {
    attachments: composerAttachments,
    error: attachmentError,
    isPreparing: isPreparingAttachments,
    addFiles,
    removeAttachment,
    clearAttachments,
    getUploadFiles,
    getMessagePreviews,
    setError: setAttachmentError,
  } = useChatAttachments()

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
    const uploadFiles = getUploadFiles()
    const trimmed = rawMessage.trim()
    const hasAttachments = uploadFiles.length > 0

    if ((!trimmed && !hasAttachments) || isLoading || isPreparingAttachments) {
      return
    }

    stopDictation()
    setDictationError(null)
    setAttachmentError(null)

    const messageAttachments = getMessagePreviews().map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      kind: attachment.kind,
      previewUrl: attachment.previewUrl,
    }))

    for (const attachment of messageAttachments) {
      if (attachment.kind === "image" && attachment.previewUrl) {
        registerMessageAttachmentPreview(attachment.id, attachment.previewUrl)
      }
    }

    setQuery("")
    clearAttachments({ revokePreviews: false })

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: trimmed,
        attachments: messageAttachments.length ? messageAttachments : undefined,
      },
    ]

    setError(null)
    setMessages(nextMessages)
    setIsLoading(true)

    try {
      const { content } = await requestAiTutorReply(
        nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        scope,
        uploadFiles
      )
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
        "relative flex h-full flex-col overflow-hidden rounded-2xl bg-white",
        "shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.06]",
        className
      )}
    >
      <header className="relative shrink-0 overflow-hidden bg-linear-to-r from-[#6C5CE7] via-[#7158e8] to-[#5b4bc7] px-4 py-3.5">
        <div
          className="pointer-events-none absolute -top-10 -right-6 size-28 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              AI Tutor
            </h2>
            <p className="truncate text-xs text-white/75">{scope.title}</p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Close AI Tutor"
            >
              <X className="size-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto bg-[#f7f6fb] px-3.5 py-4">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <h3 className="text-[15px] font-semibold text-foreground">
              {emptyHeadline}
            </h3>
            <p className="mt-1.5 max-w-[17rem] text-[13px] leading-relaxed text-muted-foreground">
              {emptyDescription}
            </p>

            <div className="mt-5 flex w-full flex-col gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void submitMessage(prompt)}
                  className="rounded-xl border border-violet-100 bg-white px-3.5 py-3 text-left text-[13px] font-medium text-foreground shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50/60 hover:shadow disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] text-[13px] leading-[1.55] shadow-sm",
                    message.role === "user"
                      ? "rounded-2xl rounded-br-md bg-linear-to-br from-[#6C5CE7] to-[#5b4bc7] px-3.5 py-2.5 text-white"
                      : "rounded-2xl rounded-bl-md border border-border/50 bg-white px-3.5 py-2.5 text-foreground"
                  )}
                >
                  {message.role === "assistant" ? (
                    <AiTutorMarkdown
                      content={message.content}
                      variant="compact"
                    />
                  ) : (
                    <>
                      <UserMessageAttachments
                        attachments={message.attachments}
                        compact
                      />
                      {message.content ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-border/50 bg-white px-3.5 py-2.5 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border/60 bg-white px-3.5 py-3">
        {error || dictationError || attachmentError ? (
          <p
            className="mb-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            role="alert"
          >
            {error ?? dictationError ?? attachmentError}
          </p>
        ) : null}

        {!isEmpty ? (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => void submitMessage(prompt)}
                className="rounded-full border border-violet-100 bg-violet-50/80 px-2.5 py-1 text-[11px] font-medium text-[#5d4ed6] transition-colors hover:border-violet-200 hover:bg-violet-100 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        <AiTutorComposer
          value={query}
          onChange={(value) => {
            setDictationError(null)
            setAttachmentError(null)
            if (isListening) stopDictation()
            setQuery(value)
          }}
          onSubmit={() => void submitMessage(query)}
          placeholder={
            scope.mode === "quiz"
              ? "Ask for a hint..."
              : "Ask about this lesson..."
          }
          disabled={isLoading}
          sendDisabled={isLoading}
          isListening={isListening}
          dictationSupported={isSupported}
          dictationError={dictationError}
          onToggleDictation={() => {
            setDictationError(null)
            toggleDictation(query, setQuery)
          }}
          attachments={composerAttachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            kind: attachment.kind,
            previewUrl: attachment.previewUrl,
          }))}
          attachmentError={attachmentError}
          isPreparingAttachments={isPreparingAttachments}
          onAddFiles={(files) => {
            setAttachmentError(null)
            void addFiles(files)
          }}
          onRemoveAttachment={removeAttachment}
          textareaRef={textareaRef}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void submitMessage(query)
            }
          }}
          compact
          sendIcon={
            isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <SendHorizontal className="size-4" aria-hidden />
            )
          }
        />
      </div>
    </div>
  )
}
