"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import {
  type ChatMessage,
  type ChatSession,
  createSessionId,
  mockChatHistory,
} from "./chat-data"

type ChatSessionsContextValue = {
  sessions: ChatSession[]
  getSession: (id: string) => ChatSession | undefined
  upsertSession: (session: ChatSession) => void
  updateSessionMessages: (
    sessionId: string,
    messages: ChatMessage[],
    title?: string
  ) => void
  createSession: (title: string) => ChatSession
}

const ChatSessionsContext = createContext<ChatSessionsContextValue | null>(null)

function sortSessions(sessions: ChatSession[]) {
  return [...sessions].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )
}

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() =>
    sortSessions(mockChatHistory)
  )

  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id),
    [sessions]
  )

  const upsertSession = useCallback((session: ChatSession) => {
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === session.id)
      const next = exists
        ? prev.map((s) => (s.id === session.id ? session : s))
        : [session, ...prev]
      return sortSessions(next)
    })
  }, [])

  const updateSessionMessages = useCallback(
    (sessionId: string, messages: ChatMessage[], title?: string) => {
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === sessionId)
        if (!exists) {
          return sortSessions([
            {
              id: sessionId,
              title: title ?? "New chat",
              messages,
              updatedAt: new Date(),
            },
            ...prev,
          ])
        }
        const next = prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages,
                updatedAt: new Date(),
                ...(title ? { title } : {}),
              }
            : s
        )
        return sortSessions(next)
      })
    },
    []
  )

  const createSession = useCallback((title: string) => {
    const session: ChatSession = {
      id: createSessionId(),
      title,
      messages: [],
      updatedAt: new Date(),
    }
    setSessions((prev) => sortSessions([session, ...prev]))
    return session
  }, [])

  const value = useMemo(
    () => ({
      sessions,
      getSession,
      upsertSession,
      updateSessionMessages,
      createSession,
    }),
    [sessions, getSession, upsertSession, updateSessionMessages, createSession]
  )

  return (
    <ChatSessionsContext.Provider value={value}>
      {children}
    </ChatSessionsContext.Provider>
  )
}

export function useChatSessions() {
  const ctx = useContext(ChatSessionsContext)
  if (!ctx) {
    throw new Error("useChatSessions must be used within ChatSessionsProvider")
  }
  return ctx
}
