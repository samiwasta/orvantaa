"use client"

import { Button } from "@workspace/ui/components/button"
import {
  MOBILE_MEDIA_QUERY,
  useBodyScrollLock,
} from "@workspace/ui/hooks/use-body-scroll-lock"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowUp, Bot, History, Plus, Bi } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
  aiTutorChatHref,
  type ChatMessage,
  type ChatSession,
  createMessageId,
  DEFAULT_CHAT_TITLE,
  NEW_CHAT_ID,
} from "../model/chat-data"
import { useChatSessions } from "../model/chat-sessions-context"
import { requestAiTutorReply } from "../service/ai-tutor-chat.service"
import { AiTutorMarkdown } from "./ai-tutor-markdown"
import {
  AssistantMessageActions,
  type MessageFeedback,
} from "./assistant-message-actions"
import { ChatHistorySheet } from "./chat-history-sheet"

const MAX_TEXTAREA_HEIGHT = 12 * 21 + 24
const CHAT_MAX_WIDTH = "max-w-3xl"

function AssistantAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#8b5cf6] text-white shadow-sm shadow-[#6C5CE7]/25",
        className
      )}
    >
      <Bot className="size-4" strokeWidth={2} />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="w-full px-3 py-4 md:px-6 md:py-6">
      <div
        className={cn(
          "mx-auto flex w-full gap-3 max-md:pl-0 md:gap-4",
          CHAT_MAX_WIDTH
        )}
      >
        <AssistantAvatar className="max-md:hidden" />
        <div className="flex h-8 items-center gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-[#6C5CE7]/70 [animation-delay:0ms]" />
          <span className="size-2 animate-bounce rounded-full bg-[#6C5CE7]/70 [animation-delay:150ms]" />
          <span className="size-2 animate-bounce rounded-full bg-[#6C5CE7]/70 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="w-full px-3 py-2 md:px-6 md:py-3">
      <div className={cn("mx-auto flex w-full justify-end", CHAT_MAX_WIDTH)}>
        <div className="max-w-[92%] rounded-3xl rounded-br-lg bg-[#6C5CE7] px-3.5 py-2.5 text-[15px] leading-relaxed text-white shadow-sm sm:max-w-[80%] sm:px-4">
          <p className="break-words whitespace-pre-wrap">{content}</p>
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
      <div className={cn("mx-auto flex w-full gap-3 md:gap-4", CHAT_MAX_WIDTH)}>
        <AssistantAvatar className="max-md:hidden" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 hidden text-sm font-semibold text-foreground md:block">
            AI Tutor
          </div>
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
    return <UserMessage content={message.content} />
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
}

function AiTutorChat({ chatId, session }: AiTutorChatProps) {
  const router = useRouter()
  const { sessions, createSession, updateSessionMessages, deleteSession } =
    useChatSessions()
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => session?.messages ?? []
  )
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(() => {
    const last = session?.messages[session.messages.length - 1]
    return last?.role === "user"
  })
  const [historyOpen, setHistoryOpen] = useState(false)
  const [messageFeedback, setMessageFeedback] = useState<
    Record<string, MessageFeedback>
  >({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pendingReplyRef = useRef(false)

  const isNewChat = chatId === NEW_CHAT_ID
  const hasMessages = messages.length > 0

  useBodyScrollLock(historyOpen, { mediaQuery: MOBILE_MEDIA_QUERY })

  useEffect(() => {
    if (!session) return

    setMessages(session.messages)
    const last = session.messages[session.messages.length - 1]
    setIsTyping(last?.role === "user")
  }, [session?.id, session])

  useEffect(() => {
    if (!isTyping || pendingReplyRef.current) return
    const last = messages[messages.length - 1]
    if (last?.role !== "user") return

    pendingReplyRef.current = true
    let cancelled = false

    const run = async () => {
      try {
        const { content } = await requestAiTutorReply(
          messages.map((message) => ({
            role: message.role,
            content: message.content,
          }))
        )

        if (cancelled) return

        const reply: ChatMessage = {
          id: createMessageId(),
          role: "assistant",
          content,
          timestamp: new Date(),
        }
        const withReply = [...messages, reply]
        const saved = await updateSessionMessages(chatId, withReply)
        if (!cancelled) {
          setMessages(saved.messages)
        }
      } catch (error) {
        if (cancelled) return

        const reply: ChatMessage = {
          id: createMessageId(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          timestamp: new Date(),
        }
        const withReply = [...messages, reply]

        setMessages(withReply)

        try {
          const saved = await updateSessionMessages(chatId, withReply)
          if (!cancelled) {
            setMessages(saved.messages)
          }
        } catch (saveError) {
          console.error("[ai-tutor] Failed to save error response:", saveError)
        }
      } finally {
        if (!cancelled) {
          setIsTyping(false)
          pendingReplyRef.current = false
        }
      }
    }

    void run()

    return () => {
      cancelled = true
      pendingReplyRef.current = false
    }
  }, [chatId, isTyping, messages, updateSessionMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [input])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping || isSending) return

    const trimmed = content.trim()
    setInput("")

    if (isNewChat) {
      setIsSending(true)
      try {
        const created = await createSession(DEFAULT_CHAT_TITLE)
        const userMsg: ChatMessage = {
          id: createMessageId(),
          role: "user",
          content: trimmed,
          timestamp: new Date(),
        }
        await updateSessionMessages(created.id, [userMsg])
        router.replace(aiTutorChatHref(created.id))
      } catch (error) {
        console.error("[ai-tutor] Failed to create chat:", error)
        setInput(trimmed)
      } finally {
        setIsSending(false)
      }
      return
    }

    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setIsTyping(true)

    try {
      await updateSessionMessages(chatId, withUser)
    } catch (error) {
      console.error("[ai-tutor] Failed to save message:", error)
      setMessages(messages)
      setIsTyping(false)
      setInput(trimmed)
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleMessageFeedback = (
    messageId: string,
    feedback: MessageFeedback
  ) => {
    setMessageFeedback((current) => ({
      ...current,
      [messageId]: feedback,
    }))
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
    setIsTyping(true)

    try {
      const saved = await updateSessionMessages(chatId, truncated)
      setMessages(saved.messages)
    } catch (error) {
      console.error("[ai-tutor] Failed to retry:", error)
      setIsTyping(false)
    }
  }

  const lastMessageId = messages[messages.length - 1]?.id

  const activeSessionId = isNewChat ? null : chatId

  const composer = (
    <form
      onSubmit={handleSubmit}
      className={cn("mx-auto w-full", CHAT_MAX_WIDTH)}
    >
      <div className="flex items-end gap-2 rounded-[1.75rem] border border-border/60 bg-white p-2 pl-3 shadow-[0_2px_16px_-8px_rgba(15,15,40,0.18)] transition-all focus-within:border-[#6C5CE7]/50 focus-within:shadow-[0_4px_24px_-8px_rgba(108,92,231,0.3)] sm:pl-4">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your subjects..."
          rows={1}
          style={{
            overflowY:
              input.includes("\n") || input.length > 100 ? "auto" : "hidden",
          }}
          className="min-h-[36px] flex-1 resize-none self-center bg-transparent py-1.5 text-[15px] leading-[1.5] text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isTyping || isSending}
          className="size-9 shrink-0 rounded-full bg-[#6C5CE7] text-white shadow-sm transition-all hover:bg-[#5d4ed6] disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60 disabled:shadow-none"
          aria-label="Send message"
        >
          <ArrowUp className="size-5" strokeWidth={2.25} aria-hidden />
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
        AI Tutor may produce inaccurate responses. Verify important information.
      </p>
    </form>
  )

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background",
        "max-md:-mx-4 max-md:-mt-4 max-md:w-[calc(100%+2rem)]",
        "md:-mx-6 md:-mt-5 md:w-[calc(100%+3rem)]"
      )}
    >
      <header className="flex shrink-0 items-center justify-end gap-2 border-b border-border/40 bg-background px-3 py-2 md:px-6 md:py-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-border/60 px-2.5 text-sm font-medium hover:border-[#6C5CE7]/40 hover:bg-violet-50/80 sm:px-3"
          onClick={handleNewChat}
        >
          <Plus className="size-4 text-[#6C5CE7]" strokeWidth={2} />
          <span className="max-sm:sr-only">New chat</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-border/60 px-2.5 text-sm font-medium hover:border-[#6C5CE7]/40 hover:bg-violet-50/80 sm:px-3"
          onClick={() => setHistoryOpen(true)}
        >
          <History className="size-4 text-[#6C5CE7]" strokeWidth={2} />
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
            <div ref={messagesEndRef} className="h-2" />
          </div>

          <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-3 pt-2 pb-3 max-md:pb-[max(0.5rem,calc(env(safe-area-inset-bottom,0px)-0.5rem))] md:px-6 md:pb-5">
            {composer}
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 md:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-7 py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8b5cf6] text-white shadow-lg shadow-[#6C5CE7]/25">
                  <Sparkles className="size-8" strokeWidth={1.75} />
                </div>
                <div className="absolute -right-0.5 -bottom-0.5 size-4 rounded-full bg-emerald-400 ring-2 ring-background" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  How can I help you today?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  Ask me about concepts, problems, quizzes, or chapter
                  summaries.
                </p>
              </div>
            </div>

            <div className="w-full">{composer}</div>
          </div>
        </div>
      )}
    </div>
  )
}

type AiTutorViewProps = {
  chatId: string
  initialSession?: ChatSession
}

export function AiTutorView({ chatId, initialSession }: AiTutorViewProps) {
  const router = useRouter()
  const { loadSession, upsertSession } = useChatSessions()
  const isNewChat = chatId === NEW_CHAT_ID
  const [session, setSession] = useState<ChatSession | undefined>(
    initialSession
  )
ot  const [isLoadingSession, setIsLoadingSession] = useState(
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

  return <AiTutorChat key={chatId} chatId={chatId} session={session} />
}
