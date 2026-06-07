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
  createAiTutorSession,
  deleteAiTutorSession,
  fetchAiTutorSession,
  syncAiTutorSession,
} from "../service/ai-tutor-sessions.service"
import type { ChatMessage, ChatSession } from "./chat-data"
import { deserializeChatSessions } from "./serialize-chat-session"

type ChatSessionsContextValue = {
  sessions: ChatSession[]
  isLoading: boolean
  getSession: (id: string) => ChatSession | undefined
  loadSession: (id: string) => Promise<ChatSession>
  upsertSession: (session: ChatSession) => void
  updateSessionMessages: (
    sessionId: string,
    messages: ChatMessage[],
    title?: string
  ) => Promise<ChatSession>
  createSession: (title: string) => Promise<ChatSession>
  deleteSession: (sessionId: string) => Promise<void>
}

const ChatSessionsContext = createContext<ChatSessionsContextValue | null>(null)

function sortSessions(sessions: ChatSession[]) {
  return [...sessions].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )
}

function upsertSessionInList(
  sessions: ChatSession[],
  session: ChatSession
): ChatSession[] {
  const exists = sessions.some((item) => item.id === session.id)
  const next = exists
    ? sessions.map((item) => (item.id === session.id ? session : item))
    : [session, ...sessions]
  return sortSessions(next)
}

type ChatSessionsProviderProps = {
  children: ReactNode
  initialSessions?: ChatSession[]
}

export function ChatSessionsProvider({
  children,
  initialSessions = [],
}: ChatSessionsProviderProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(() =>
    sortSessions(deserializeChatSessions(initialSessions))
  )
  const [isLoading] = useState(false)

  const getSession = useCallback(
    (id: string) => sessions.find((session) => session.id === id),
    [sessions]
  )

  const upsertSession = useCallback((session: ChatSession) => {
    setSessions((current) => upsertSessionInList(current, session))
  }, [])

  const loadSession = useCallback(async (id: string) => {
    const session = await fetchAiTutorSession(id)
    setSessions((current) => upsertSessionInList(current, session))
    return session
  }, [])

  const updateSessionMessages = useCallback(
    async (sessionId: string, messages: ChatMessage[], title?: string) => {
      const session = await syncAiTutorSession(sessionId, {
        title,
        messages,
      })
      setSessions((current) => upsertSessionInList(current, session))
      return session
    },
    []
  )

  const createSession = useCallback(async (title: string) => {
    const session = await createAiTutorSession(title)
    setSessions((current) => upsertSessionInList(current, session))
    return session
  }, [])

  const deleteSession = useCallback(async (sessionId: string) => {
    await deleteAiTutorSession(sessionId)
    setSessions((current) =>
      current.filter((session) => session.id !== sessionId)
    )
  }, [])

  const value = useMemo(
    () => ({
      sessions,
      isLoading,
      getSession,
      loadSession,
      upsertSession,
      updateSessionMessages,
      createSession,
      deleteSession,
    }),
    [
      sessions,
      isLoading,
      getSession,
      loadSession,
      upsertSession,
      updateSessionMessages,
      createSession,
      deleteSession,
    ]
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
