import type { ChatSession } from "../model/chat-data"

export function deserializeChatSession(session: ChatSession): ChatSession {
  return {
    ...session,
    updatedAt: new Date(session.updatedAt),
    messages: session.messages.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    })),
  }
}

export function deserializeChatSessions(
  sessions: ChatSession[]
): ChatSession[] {
  return sessions.map(deserializeChatSession)
}
