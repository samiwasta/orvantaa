import { ChatSessionsProvider } from "@/features/ai-tutor/model/chat-sessions-context"

export default function AiTutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ChatSessionsProvider>{children}</ChatSessionsProvider>
}
