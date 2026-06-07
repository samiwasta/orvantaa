import { redirect } from "next/navigation"

import { NEW_CHAT_ID } from "@/features/ai-tutor/model/chat-data"
import { ChatSessionsProvider } from "@/features/ai-tutor/model/chat-sessions-context"
import { loadAiTutorSessionsForCurrentStudent } from "@/features/ai-tutor/server/load-ai-tutor-sessions"

export default async function AiTutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialSessions = await loadAiTutorSessionsForCurrentStudent()

  return (
    <ChatSessionsProvider initialSessions={initialSessions}>
      {children}
    </ChatSessionsProvider>
  )
}
