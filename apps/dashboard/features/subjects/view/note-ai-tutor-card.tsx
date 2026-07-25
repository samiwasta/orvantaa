"use client"

import { IconlySearch } from "@workspace/icons"
import { cn } from "@workspace/ui/lib/utils"
import { X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { useChatAttachments } from "@/features/ai-tutor/hooks/use-chat-attachments"
import { useSpeechDictation } from "@/features/ai-tutor/hooks/use-speech-dictation"
import { registerMessageAttachmentPreview } from "@/features/ai-tutor/model/message-attachment-preview-registry"
import { requestAiTutorReply } from "@/features/ai-tutor/service/ai-tutor-chat.service"
import { AiTutorComposer } from "@/features/ai-tutor/view/ai-tutor-composer"
import { AiTutorMarkdown } from "@/features/ai-tutor/view/ai-tutor-markdown"
import { UserMessageAttachments } from "@/features/ai-tutor/view/user-message-attachments"

import type { AiTutorWidgetScope } from "../model/ai-tutor-scope"
import {
  readWidgetChatSession,
  type WidgetChatMessage,
  writeWidgetChatSession,
} from "../model/widget-chat-session"

const MAX_TEXTAREA_HEIGHT = 4 * 20
const TEXTAREA_LINE_HEIGHT = 20

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

type ChatMessage = WidgetChatMessage

type NoteAiTutorCardProps = {
  scope: AiTutorWidgetScope
  onClose?: () => void
  className?: string
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1.5 px-0.5" aria-label="Typing">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 animate-bounce rounded-full bg-[#4169E1]/55"
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
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    readWidgetChatSession(scope)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dictationError, setDictationError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scopeKeyRef = useRef(
    `${scope.mode ?? "note"}|${scope.title}|${scope.content ?? ""}`
  )

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
    el.style.height = `${TEXTAREA_LINE_HEIGHT}px`
    if (!el.value) return
    el.style.height = "auto"
    el.style.height = `${Math.max(
      TEXTAREA_LINE_HEIGHT,
      Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)
    )}px`
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [query, adjustTextareaHeight])

  useEffect(() => {
    const nextKey = `${scope.mode ?? "note"}|${scope.title}|${scope.content ?? ""}`
    if (scopeKeyRef.current !== nextKey) {
      scopeKeyRef.current = nextKey
      setMessages(readWidgetChatSession(scope))
      setQuery("")
      setError(null)
      return
    }

    writeWidgetChatSession(scope, messages)
  }, [scope, messages])

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
        "relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white",
        "shadow-[0_28px_64px_-28px_rgba(45,40,90,0.45)] ring-1 ring-black/[0.05]",
        className
      )}
    >
      <header className="relative shrink-0 overflow-hidden bg-[#4169E1] px-4 py-3.5 sm:px-5">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.18),transparent_55%)]"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
            <IconlySearch size={18} color="white" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              AI Tutor
            </h2>
            <p className="truncate text-[12px] font-light text-white/70">
              {scope.title}
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Close AI Tutor"
            >
              <X className="size-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto bg-[#FAFBFF] px-4 py-5">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-1 text-center">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground/90">
              {emptyHeadline}
            </h3>
            <p className="mt-1.5 max-w-[16.5rem] text-[13px] leading-relaxed font-light text-muted-foreground">
              {emptyDescription}
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void submitMessage(prompt)}
                  className="rounded-2xl border border-[#E8EEFF] bg-white px-4 py-3 text-left text-[13px] font-medium text-foreground/85 shadow-[0_2px_10px_-6px_rgba(65,105,225,0.18)] transition-all hover:border-[#d9e0ff] hover:bg-white hover:shadow-[0_6px_18px_-10px_rgba(65,105,225,0.28)] disabled:opacity-50"
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
                    "max-w-[90%] text-[13.5px] leading-[1.55]",
                    message.role === "user"
                      ? "rounded-3xl rounded-br-lg bg-[#4169E1] px-3.5 py-2.5 text-white shadow-sm"
                      : "rounded-3xl rounded-bl-lg border border-[#E8EEFF] bg-white px-3.5 py-2.5 text-foreground shadow-[0_2px_10px_-6px_rgba(65,105,225,0.14)]"
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
                <div className="rounded-3xl rounded-bl-lg border border-[#E8EEFF] bg-white px-3.5 py-3 shadow-[0_2px_10px_-6px_rgba(65,105,225,0.14)]">
                  <TypingDots />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-gradient-to-t from-white via-white to-white/90 px-3.5 pt-2 pb-3.5 sm:px-4 sm:pb-4">
        {error ? (
          <p
            className="mb-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            role="alert"
          >
            {error}
          </p>
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
          maxTextareaHeight={MAX_TEXTAREA_HEIGHT}
          variant="premium"
          compact
        />
      </div>
    </div>
  )
}
