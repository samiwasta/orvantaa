import { requireStudentSession } from "@/lib/auth/session"

import { aiTutorChatRepository } from "../repository/ai-tutor-chat.repository"

export async function loadAiTutorSessionsForCurrentStudent() {
  const session = await requireStudentSession()
  return aiTutorChatRepository.listSessionsForUser(session.sub)
}

export async function loadAiTutorSessionForCurrentStudent(sessionId: string) {
  const session = await requireStudentSession()
  return aiTutorChatRepository.findSessionForUser(session.sub, sessionId)
}
