import { redirect } from "next/navigation"

import {
  aiTutorChatHref,
  NEW_CHAT_ID,
} from "@/features/ai-tutor/model/chat-data"

export default function AiTutorIndexPage() {
  redirect(aiTutorChatHref(NEW_CHAT_ID))
}
