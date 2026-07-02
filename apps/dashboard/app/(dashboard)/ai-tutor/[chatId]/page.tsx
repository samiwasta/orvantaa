import type { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  aiTutorChatHref,
  NEW_CHAT_ID,
} from "@/features/ai-tutor/model/chat-data"
import { loadAiTutorSessionForCurrentStudent } from "@/features/ai-tutor/server/load-ai-tutor-sessions"
import { AiTutorView } from "@/features/ai-tutor/view/ai-tutor-view"
import { loadDashboardUserFirstName } from "@/features/dashboard/server/load-dashboard-user-first-name"

export const metadata: Metadata = {
  title: "AI Tutor - Orvantaa",
  description: "Get instant help with your studies from your AI tutor",
}

type AiTutorChatPageProps = {
  params: Promise<{ chatId: string }>
}

export default async function AiTutorChatPage({
  params,
}: AiTutorChatPageProps) {
  const { chatId } = await params
  const userFirstName = await loadDashboardUserFirstName()

  if (chatId === NEW_CHAT_ID) {
    return <AiTutorView chatId={chatId} userFirstName={userFirstName} />
  }

  const session = await loadAiTutorSessionForCurrentStudent(chatId)

  if (!session) {
    redirect(aiTutorChatHref(NEW_CHAT_ID))
  }

  return (
    <AiTutorView
      chatId={chatId}
      initialSession={session}
      userFirstName={userFirstName}
    />
  )
}
