"use client"

import { Button } from "@workspace/ui/components/button"
import {
  MOBILE_MEDIA_QUERY,
  useBodyScrollLock,
} from "@workspace/ui/hooks/use-body-scroll-lock"
import { cn } from "@workspace/ui/lib/utils"
import { History } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useChatAttachments } from "../hooks/use-chat-attachments"
import { useSpeechDictation } from "../hooks/use-speech-dictation"
import { buildAiTutorGreetingMessage } from "../model/ai-tutor-greeting"
import {
  aiTutorChatHref,
  type ChatMessage,
  type ChatSession,
  createMessageId,
  DEFAULT_CHAT_TITLE,
  NEW_CHAT_ID,
} from "../model/chat-data"
import { useChatSessions } from "../model/chat-sessions-context"
import {
  hydrateMessageAttachmentPreviews,
  mergeMessageAttachmentPreviews,
  registerMessageAttachmentPreview,
} from "../model/message-attachment-preview-registry"
import {
  clearPendingChatMessageProcessing,
  setPendingChatMessage,
  takePendingChatMessage,
} from "../model/pending-chat-message"
import {
  stashChatUploads,
  takeChatUploads,
} from "../model/pending-chat-uploads"
import { requestAiTutorReply } from "../service/ai-tutor-chat.service"
import { submitAiTutorMessageFeedback } from "../service/ai-tutor-feedback.service"
import { AiTutorComposer } from "./ai-tutor-composer"
import { AiTutorMarkdown } from "./ai-tutor-markdown"
import {
  AssistantMessageActions,
  type MessageFeedback,
} from "./assistant-message-actions"
import { ChatHistorySheet } from "./chat-history-sheet"
import { UserMessageAttachments } from "./user-message-attachments"

const MAX_TEXTAREA_HEIGHT = 12 * 21 + 24
const CHAT_MAX_WIDTH = "max-w-3xl"
const DASHBOARD_NAV_CLEARANCE =
  "pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-0"

function TypingIndicator() {
  return (
    <div className="w-full px-3 py-4 md:px-6 md:py-6">
      <div className={cn("mx-auto w-full", CHAT_MAX_WIDTH)}>
        <div className="flex h-8 items-center gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-[#4169E1]/70 [animation-delay:0ms]" />
          <span className="size-2 animate-bounce rounded-full bg-[#4169E1]/70 [animation-delay:150ms]" />
          <span className="size-2 animate-bounce rounded-full bg-[#4169E1]/70 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function UserMessage({
  content,
  attachments,
}: {
  content: string
  attachments?: ChatMessage["attachments"]
}) {
  return (
    <div className="w-full px-3 py-2 md:px-6 md:py-3">
      <div className={cn("mx-auto flex w-full justify-end", CHAT_MAX_WIDTH)}>
        <div className="max-w-[92%] rounded-3xl rounded-br-lg bg-[#4169E1] px-3.5 py-2.5 text-[15px] leading-relaxed text-white shadow-sm sm:max-w-[80%] sm:px-4">
          <UserMessageAttachments attachments={attachments} />
          {content ? (
            <p className="break-words whitespace-pre-wrap">{content}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AssistantMessage({
  content,
  feedback,
  canRetry,
  actionsDisabled,
  onFeedback,
  onRetry,
}: {
  content: string
  feedback: MessageFeedback
  canRetry: boolean
  actionsDisabled?: boolean
  onFeedback: (feedback: MessageFeedback) => void
  onRetry: () => void
}) {
  return (
    <div className="w-full px-3 py-4 md:px-6 md:py-6">
      <div className={cn("mx-auto w-full", CHAT_MAX_WIDTH)}>
        <div className="min-w-0">
          <AiTutorMarkdown content={content} />
          <AssistantMessageActions
            content={content}
            feedback={feedback}
            canRetry={canRetry}
            disabled={actionsDisabled}
            onFeedback={onFeedback}
            onRetry={onRetry}
          />
        </div>
      </div>
    </div>
  )
}

function ChatMessageRow({
  message,
  feedback,
  canRetry,
  actionsDisabled,
  onFeedback,
  onRetry,
}: {
  message: ChatMessage
  feedback: MessageFeedback
  canRetry: boolean
  actionsDisabled?: boolean
  onFeedback: (feedback: MessageFeedback) => void
  onRetry: () => void
}) {
  if (message.role === "user") {
    return (
      <UserMessage
        content={message.content}
        attachments={message.attachments}
      />
    )
  }

  return (
    <AssistantMessage
      content={message.content}
      feedback={feedback}
      canRetry={canRetry}
      actionsDisabled={actionsDisabled}
      onFeedback={onFeedback}
      onRetry={onRetry}
    />
  )
}

type AiTutorChatProps = {
  chatId: string
  session: ChatSession | undefined
  userFirstName?: string
}

function AiTutorChat({ chatId, session, userFirstName }: AiTutorChatProps) {
  const router = useRouter()
  const { sessions, createSession, updateSessionMessages, deleteSession } =
    useChatSessions()
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    hydrateMessageAttachmentPreviews(session?.messages ?? [])
  )
  const [input, setInput] = useState("")
  const [dictationError, setDictationError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [messageFeedback, setMessageFeedback] = useState<
    Record<string, MessageFeedback>
  >({})
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pendingReplyRef = useRef(false)
  const pendingMessageHandledRef = useRef(false)
  const resumedSessionIdRef = useRef<string | null>(null)

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

  const {
    isListening,
    isSupported,
    toggle: toggleDictation,
    stop: stopDictation,
  } = useSpeechDictation({
    onError: setDictationError,
  })

  const isNewChat = chatId === NEW_CHAT_ID
  const hasMessages = messages.length > 0

  useBodyScrollLock(historyOpen, { mediaQuery: MOBILE_MEDIA_QUERY })

  useEffect(() => {
    if (!session) return

    const hydrated = hydrateMessageAttachmentPreviews(session.messages)
    setMessages(hydrated)
    setMessageFeedback(
      Object.fromEntries(
        hydrated
          .filter((message) => message.role === "assistant" && message.feedback)
          .map((message) => [message.id, message.feedback as MessageFeedback])
      )
    )
  }, [session?.id, session])

  const requestAssistantReply = async (
    threadMessages: ChatMessage[],
    uploadFiles: File[],
    targetChatId: string
  ) => {
    if (pendingReplyRef.current) return

    pendingReplyRef.current = true
    setIsTyping(true)

    try {
      const { content } = await requestAiTutorReply(
        threadMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        undefined,
        uploadFiles
      )

      const reply: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content,
        timestamp: new Date(),
      }
      const withReply = [...threadMessages, reply]
      const saved = await updateSessionMessages(targetChatId, withReply)
      setMessages(mergeMessageAttachmentPreviews(saved.messages, withReply))
    } catch (error) {
      const reply: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        timestamp: new Date(),
      }
      const withReply = [...threadMessages, reply]

      setMessages(withReply)

      try {
        const saved = await updateSessionMessages(targetChatId, withReply)
        setMessages(mergeMessageAttachmentPreviews(saved.messages, withReply))
      } catch (saveError) {
        console.error("[ai-tutor] Failed to save error response:", saveError)
      }
    } finally {
      setIsTyping(false)
      pendingReplyRef.current = false
    }
  }

  useEffect(() => {
    resumedSessionIdRef.current = null
  }, [chatId])

  useEffect(() => {
    if (!session || isNewChat) return
    if (resumedSessionIdRef.current === session.id) return

    const last = session.messages[session.messages.length - 1]
    resumedSessionIdRef.current = session.id

    if (last?.role !== "user") return

    const uploadFiles = takeChatUploads(chatId)
    void requestAssistantReply(session.messages, uploadFiles, chatId)
  }, [chatId, isNewChat, session])

  useEffect(() => {
    const container = messagesScrollRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, isTyping])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    const minHeight = 24
    el.style.height = "auto"
    el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT))}px`
  }, [input])

  const sendMessage = async (content: string) => {
    const uploadFiles =
      getUploadFiles().length > 0
        ? getUploadFiles()
        : isNewChat
          ? takeChatUploads(NEW_CHAT_ID)
          : []
    const hasContent = content.trim().length > 0
    const hasAttachments = uploadFiles.length > 0

    if ((!hasContent && !hasAttachments) || isTyping || isSending) return

    stopDictation()
    setDictationError(null)
    setAttachmentError(null)

    const trimmed = content.trim()
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

    setInput("")
    clearAttachments({ revokePreviews: false })

    if (isNewChat) {
      setIsSending(true)
      try {
        const created = await createSession(DEFAULT_CHAT_TITLE)
        const userMsg: ChatMessage = {
          id: createMessageId(),
          role: "user",
          content: trimmed,
          timestamp: new Date(),
          attachments: messageAttachments.length
            ? messageAttachments
            : undefined,
        }
        stashChatUploads(created.id, uploadFiles)
        await updateSessionMessages(created.id, [userMsg])
        router.replace(aiTutorChatHref(created.id))
      } catch (error) {
        console.error("[ai-tutor] Failed to create chat:", error)
        setInput(trimmed)
        setPendingChatMessage(trimmed)
      } finally {
        setIsSending(false)
        clearPendingChatMessageProcessing()
      }
      return
    }

    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
      attachments: messageAttachments.length ? messageAttachments : undefined,
    }

    const withUser = [...messages, userMsg]
    setMessages(withUser)

    try {
      await updateSessionMessages(chatId, withUser)
      setMessages(withUser)
      await requestAssistantReply(withUser, uploadFiles, chatId)
    } catch (error) {
      console.error("[ai-tutor] Failed to save message:", error)
      setMessages(messages)
      setInput(trimmed)
    }
  }

  useEffect(() => {
    if (!isNewChat || pendingMessageHandledRef.current || hasMessages) return

    const pending = takePendingChatMessage()
    if (!pending) return

    pendingMessageHandledRef.current = true
    void sendMessage(pending)
  }, [hasMessages, isNewChat])

  const handleSelectSession = (sessionId: string) => {
    router.push(aiTutorChatHref(sessionId))
  }

  const handleNewChat = () => {
    router.push(aiTutorChatHref(NEW_CHAT_ID))
  }

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId)

    if (sessionId === chatId) {
      router.replace(aiTutorChatHref(NEW_CHAT_ID))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(input)
    }
  }

  const handleMessageFeedback = (
    messageId: string,
    feedback: MessageFeedback
  ) => {
    const previousFeedback = messageFeedback[messageId] ?? null

    setMessageFeedback((current) => ({
      ...current,
      [messageId]: feedback,
    }))
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, feedback } : message
      )
    )

    void submitAiTutorMessageFeedback(messageId, feedback)
      .then((savedFeedback) => {
        setMessageFeedback((current) => ({
          ...current,
          [messageId]: savedFeedback,
        }))
        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? { ...message, feedback: savedFeedback }
              : message
          )
        )
      })
      .catch((error) => {
        console.error("[ai-tutor] Failed to save feedback:", error)
        setMessageFeedback((current) => ({
          ...current,
          [messageId]: previousFeedback,
        }))
        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? { ...message, feedback: previousFeedback }
              : message
          )
        )
      })
  }

  const handleRetry = async (assistantMessageId: string) => {
    if (isTyping || isSending) return

    const index = messages.findIndex(
      (message) => message.id === assistantMessageId
    )
    if (index === -1) return

    const truncated = messages.slice(0, index)
    const last = truncated[truncated.length - 1]
    if (last?.role !== "user") return

    setMessageFeedback((current) => {
      const next = { ...current }
      delete next[assistantMessageId]
      return next
    })

    setMessages(truncated)

    try {
      const saved = await updateSessionMessages(chatId, truncated)
      setMessages(mergeMessageAttachmentPreviews(saved.messages, truncated))
      await requestAssistantReply(saved.messages, [], chatId)
    } catch (error) {
      console.error("[ai-tutor] Failed to retry:", error)
    }
  }

  const lastMessageId = messages[messages.length - 1]?.id

  const activeSessionId = isNewChat ? null : chatId

  const heroComposer = (
    <AiTutorComposer
      className={cn("mx-auto w-full", CHAT_MAX_WIDTH)}
      variant="premium"
      value={input}
      onChange={(value) => {
        setDictationError(null)
        setAttachmentError(null)
        if (isListening) stopDictation()
        setInput(value)
      }}
      onSubmit={() => sendMessage(input)}
      placeholder="Ask your tutor"
      disabled={isTyping || isSending}
      sendDisabled={isTyping || isSending}
      isListening={isListening}
      dictationSupported={isSupported}
      dictationError={dictationError}
      onToggleDictation={() => {
        setDictationError(null)
        toggleDictation(input, setInput)
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
      textareaRef={inputRef}
      onKeyDown={handleKeyDown}
      maxTextareaHeight={MAX_TEXTAREA_HEIGHT}
    />
  )

  const composer = (
    <AiTutorComposer
      className={cn("mx-auto w-full", CHAT_MAX_WIDTH)}
      value={input}
      onChange={(value) => {
        setDictationError(null)
        setAttachmentError(null)
        if (isListening) stopDictation()
        setInput(value)
      }}
      onSubmit={() => sendMessage(input)}
      placeholder="Ask anything about your subjects..."
      disabled={isTyping || isSending}
      sendDisabled={isTyping || isSending}
      isListening={isListening}
      dictationSupported={isSupported}
      dictationError={dictationError}
      onToggleDictation={() => {
        setDictationError(null)
        toggleDictation(input, setInput)
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
      textareaRef={inputRef}
      onKeyDown={handleKeyDown}
      maxTextareaHeight={MAX_TEXTAREA_HEIGHT}
      footerText="AI Tutor may produce inaccurate responses. Verify important information."
    />
  )

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col bg-background",
        DASHBOARD_NAV_CLEARANCE,
        hasMessages ? "overflow-hidden" : "overflow-visible"
      )}
    >
      <header className="flex shrink-0 items-center justify-start border-b border-border/40 bg-background px-3 py-2 md:px-6 md:py-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-border/60 px-2.5 text-sm font-medium hover:border-[#4169E1]/40 hover:bg-[#F0F4FF]/80 sm:px-3"
          onClick={() => setHistoryOpen(true)}
        >
          <History className="size-4 text-[#4169E1]" strokeWidth={2} />
          <span className="max-sm:sr-only">Chat History</span>
        </Button>
      </header>

      <ChatHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {hasMessages ? (
        <>
          <div
            ref={messagesScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="flex w-full flex-col py-3 md:py-6">
              {messages.map((msg) => (
                <ChatMessageRow
                  key={msg.id}
                  message={msg}
                  feedback={messageFeedback[msg.id] ?? null}
                  canRetry={
                    msg.role === "assistant" && msg.id === lastMessageId
                  }
                  actionsDisabled={isTyping}
                  onFeedback={(feedback) =>
                    handleMessageFeedback(msg.id, feedback)
                  }
                  onRetry={() => handleRetry(msg.id)}
                />
              ))}
              {isTyping ? <TypingIndicator /> : null}
            </div>
          </div>

          <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-3 pt-2 md:px-6">
            {composer}
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-3 md:px-6">
          <div className="relative isolate mx-auto flex w-full max-w-3xl flex-1 flex-col items-center overflow-visible">
            <div
              className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-visible"
              aria-hidden
            >
              <div className="absolute h-[min(68vw,26rem)] w-[min(88vw,36rem)] -translate-y-6 rounded-full bg-gradient-to-r from-sky-300/25 via-sky-200/20 to-cyan-200/18 blur-[110px] sm:-translate-y-8" />
              <div className="absolute h-52 w-72 -translate-x-[38%] translate-y-0 rounded-full bg-gradient-to-br from-[#4169E1]/20 to-indigo-200/16 blur-[96px] sm:translate-y-2" />
              <div className="absolute h-48 w-64 translate-x-[42%] -translate-y-6 rounded-full bg-gradient-to-bl from-sky-300/18 to-[#C7D7FF]/16 blur-[88px] sm:-translate-y-8" />
              <div className="absolute h-36 w-[min(76vw,28rem)] translate-y-4 rounded-full bg-gradient-to-t from-cyan-100/14 via-transparent to-[#E0E7FF]/12 blur-[80px] sm:translate-y-2" />
            </div>

            <div className="flex-[2] max-md:flex-[1.5]" aria-hidden />

            <div className="relative z-10 flex w-full flex-col items-center gap-10 sm:gap-12">
              <h1 className="max-w-xl text-center font-[family-name:var(--font-poppins)] text-[1.75rem] font-light tracking-[-0.02em] text-foreground/90 sm:text-[2.5rem] sm:leading-[1.15]">
                {buildAiTutorGreetingMessage(userFirstName)}
              </h1>

              <div className={cn("w-full", CHAT_MAX_WIDTH)}>
                {heroComposer}

                <p className="mt-4 text-center text-[11px] font-light tracking-wide text-muted-foreground/55">
                  AI Tutor may produce inaccurate responses. Verify important
                  information.
                </p>
              </div>
            </div>

            <div className="flex-[3] max-md:flex-[2.5]" aria-hidden />
          </div>
        </div>
      )}
    </div>
  )
}

type AiTutorViewProps = {
  chatId: string
  initialSession?: ChatSession
  userFirstName?: string
}

export function AiTutorView({
  chatId,
  initialSession,
  userFirstName,
}: AiTutorViewProps) {
  const router = useRouter()
  const { loadSession, upsertSession } = useChatSessions()
  const isNewChat = chatId === NEW_CHAT_ID
  const [session, setSession] = useState<ChatSession | undefined>(
    initialSession
  )
  const [isLoadingSession, setIsLoadingSession] = useState(
    () => !isNewChat && !initialSession
  )

  useEffect(() => {
    if (isNewChat) {
      setSession(undefined)
      setIsLoadingSession(false)
      return
    }

    if (initialSession) {
      setSession(initialSession)
      upsertSession(initialSession)
      setIsLoadingSession(false)
      return
    }

    let cancelled = false
    setIsLoadingSession(true)

    loadSession(chatId)
      .then((loaded) => {
        if (!cancelled) {
          setSession(loaded)
        }
      })
      .catch(() => {
        if (!cancelled) {
          router.replace(aiTutorChatHref(NEW_CHAT_ID))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSession(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [chatId, initialSession, isNewChat, loadSession, router, upsertSession])

  if (isLoadingSession) {
    return null
  }

  if (!isNewChat && !session) {
    return null
  }

  return (
    <AiTutorChat
      key={chatId}
      chatId={chatId}
      session={session}
      userFirstName={userFirstName}
    />
  )
}
