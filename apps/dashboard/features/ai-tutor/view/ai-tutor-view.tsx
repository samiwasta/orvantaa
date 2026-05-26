"use client"

import { Button } from "@workspace/ui/components/button"
import {
  MOBILE_MEDIA_QUERY,
  useBodyScrollLock,
} from "@workspace/ui/hooks/use-body-scroll-lock"
import { cn } from "@workspace/ui/lib/utils"
import {
  BookOpen,
  Bot,
  Brain,
  HelpCircle,
  History,
  SendHorizontal,
  User,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
  aiTutorChatHref,
  type ChatMessage,
  type ChatSession,
  createMessageId,
  createMockAssistantReply,
  createSessionId,
  NEW_CHAT_ID,
  suggestedPrompts,
  titleFromFirstMessage,
} from "../model/chat-data"
import { useChatSessions } from "../model/chat-sessions-context"
import { ChatHistorySheet } from "./chat-history-sheet"

const MAX_TEXTAREA_HEIGHT = 12 * 21 + 24
const SUGGESTION_ICONS = [Brain, Zap, HelpCircle, BookOpen]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="size-1.5 animate-bounce rounded-full bg-[#6C5CE7] [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-[#6C5CE7] [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-[#6C5CE7] [animation-delay:300ms]" />
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div
      className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full shadow-sm",
          isUser
            ? "bg-[#6C5CE7] text-white"
            : "bg-gradient-to-br from-violet-50 to-purple-100 text-[#6C5CE7] ring-1 ring-violet-200/60"
        )}
      >
        {isUser ? (
          <User className="size-3.5" strokeWidth={2.25} />
        ) : (
          <Bot className="size-3.5" strokeWidth={2.25} />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed sm:max-w-[70%]",
          isUser
            ? "rounded-tr-sm bg-[#6C5CE7] text-white shadow-sm"
            : "rounded-tl-sm bg-white text-foreground shadow-sm ring-1 ring-border/40"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

type AiTutorChatProps = {
  chatId: string
  session: ChatSession | undefined
}

function AiTutorChat({ chatId, session }: AiTutorChatProps) {
  const router = useRouter()
  const { sessions, updateSessionMessages } = useChatSessions()
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => session?.messages ?? []
  )
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(() => {
    const last = session?.messages[session.messages.length - 1]
    return last?.role === "user"
  })
  const [historyOpen, setHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pendingReplyRef = useRef(false)

  const isNewChat = chatId === NEW_CHAT_ID
  const hasMessages = messages.length > 0

  useBodyScrollLock(historyOpen, { mediaQuery: MOBILE_MEDIA_QUERY })

  useEffect(() => {
    if (!isTyping || pendingReplyRef.current) return
    const last = messages[messages.length - 1]
    if (last?.role !== "user") return

    pendingReplyRef.current = true
    const userContent = last.content
    const timer = setTimeout(() => {
      const reply: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: createMockAssistantReply(userContent),
        timestamp: new Date(),
      }
      const withReply = [...messages, reply]
      updateSessionMessages(chatId, withReply)
      setMessages(withReply)
      setIsTyping(false)
      pendingReplyRef.current = false
    }, 1200)

    return () => {
      clearTimeout(timer)
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

  const sendMessage = (content: string) => {
    if (!content.trim() || isTyping) return

    let sessionId = chatId
    if (isNewChat) {
      sessionId = createSessionId()
    }

    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    const priorMessages = isNewChat ? [] : messages
    const withUser = [...priorMessages, userMsg]

    updateSessionMessages(
      sessionId,
      withUser,
      priorMessages.length === 0 ? titleFromFirstMessage(content) : undefined
    )

    setInput("")

    if (isNewChat) {
      router.replace(aiTutorChatHref(sessionId))
      return
    }

    setMessages(withUser)
    setIsTyping(true)
  }

  const handleSelectSession = (sessionId: string) => {
    router.push(aiTutorChatHref(sessionId))
  }

  const handleNewChat = () => {
    router.push(aiTutorChatHref(NEW_CHAT_ID))
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

  const activeSessionId = isNewChat ? null : chatId

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden",
        "-mx-4 -mt-6 md:-mx-6 md:-mt-6",
        "h-[calc(100dvh-3.5rem-5.75rem-max(0px,calc(env(safe-area-inset-bottom,0px)-0.75rem)))]",
        "md:h-[calc(100dvh-5rem)]"
      )}
    >
      <div className="absolute top-3 right-4 z-10 md:top-4 md:right-6">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-8 rounded-lg border-border/60 bg-white/95 shadow-sm backdrop-blur-sm hover:border-[#6C5CE7]/40 hover:bg-violet-50/80"
          onClick={() => setHistoryOpen(true)}
          aria-label="Open chat history"
        >
          <History className="size-4 text-[#6C5CE7]" strokeWidth={2} />
        </Button>
      </div>

      <ChatHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      {hasMessages ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-12 pb-4 md:px-6 md:pt-14">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping ? (
              <div className="flex items-start gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-50 to-purple-100 text-[#6C5CE7] shadow-sm ring-1 ring-violet-200/60">
                  <Bot className="size-3.5" strokeWidth={2.25} />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-border/40">
                  <TypingIndicator />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pt-10">
          <div className="flex max-w-md flex-col items-center gap-5">
            <div className="relative">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8b5cf6] text-white shadow-lg shadow-[#6C5CE7]/25 sm:size-16">
                <Bot className="size-7 sm:size-8" strokeWidth={1.5} />
              </div>
              <div className="absolute -right-0.5 -bottom-0.5 size-4 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Hi, how can I help?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Ask me anything about your subjects — concepts, problems,
                quizzes, or chapter summaries.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:gap-2.5">
              {suggestedPrompts.map((sp, i) => {
                const Icon =
                  SUGGESTION_ICONS[i % SUGGESTION_ICONS.length] ?? Brain
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => sendMessage(sp.prompt)}
                    className="group flex items-center gap-2.5 rounded-xl border border-border/60 bg-white px-3.5 py-3 text-left text-sm shadow-sm transition-all hover:border-[#6C5CE7]/40 hover:bg-violet-50/60 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100/80 text-[#6C5CE7] transition-colors group-hover:bg-[#6C5CE7]/15">
                      <Icon className="size-4" strokeWidth={2} />
                    </div>
                    <span className="font-medium text-foreground">
                      {sp.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-border/30 bg-gradient-to-t from-background via-background to-background/80 px-4 pt-3 pb-2 max-md:pb-[max(0.25rem,calc(env(safe-area-inset-bottom,0px)-0.5rem))] md:px-6 md:pb-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border/50 bg-white px-3 py-2 shadow-sm ring-1 ring-black/[0.02] transition-all focus-within:border-[#6C5CE7]/50 focus-within:shadow-md focus-within:ring-[#6C5CE7]/10">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              style={{
                overflowY:
                  input.includes("\n") || input.length > 100
                    ? "auto"
                    : "hidden",
              }}
              className="min-h-[36px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm leading-[1.5] text-foreground outline-none placeholder:text-muted-foreground/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="size-8 shrink-0 rounded-lg bg-[#6C5CE7] text-white shadow-sm transition-all hover:bg-[#5d4ed6] disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 disabled:shadow-none"
              aria-label="Send message"
            >
              <SendHorizontal className="size-4" aria-hidden />
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[10.5px] text-muted-foreground/50">
            AI Tutor may produce inaccurate responses. Verify important
            information.
          </p>
        </form>
      </div>
    </div>
  )
}

type AiTutorViewProps = {
  chatId: string
}

export function AiTutorView({ chatId }: AiTutorViewProps) {
  const router = useRouter()
  const { getSession } = useChatSessions()
  const isNewChat = chatId === NEW_CHAT_ID
  const session = isNewChat ? undefined : getSession(chatId)

  useEffect(() => {
    if (!isNewChat && !session) {
      router.replace(aiTutorChatHref(NEW_CHAT_ID))
    }
  }, [isNewChat, session, router])

  if (!isNewChat && !session) {
    return null
  }

  return <AiTutorChat key={chatId} chatId={chatId} session={session} />
}
