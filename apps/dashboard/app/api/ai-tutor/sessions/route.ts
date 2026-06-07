import { NextResponse } from "next/server"

import { DEFAULT_CHAT_TITLE } from "@/features/ai-tutor/model/chat-data"
import { parseCreateAiTutorSession } from "@/features/ai-tutor/model/session-request"
import { aiTutorChatRepository } from "@/features/ai-tutor/repository/ai-tutor-chat.repository"
import { requireStudentSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await requireStudentSession()
    const sessions = await aiTutorChatRepository.listSessionsForUser(
      session.sub
    )
    return NextResponse.json({ sessions })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireStudentSession()
    let body: unknown

    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const parsed = parseCreateAiTutorSession(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid session data." },
        { status: 400 }
      )
    }

    const created = await aiTutorChatRepository.createSession(
      session.sub,
      parsed.data.title ?? DEFAULT_CHAT_TITLE
    )

    return NextResponse.json({ session: created }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}
