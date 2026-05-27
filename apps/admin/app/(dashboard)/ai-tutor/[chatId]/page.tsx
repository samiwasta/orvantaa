import type { Metadata } from "next"

import { AiTutorView } from "@/features/ai-tutor/view/ai-tutor-view"

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
  return <AiTutorView chatId={chatId} />
}
