import { NextResponse } from "next/server"

import { parseSyncAiTutorSession } from "@/features/ai-tutor/model/session-request"
import { aiTutorChatRepository } from "@/features/ai-tutor/repository/ai-tutor-chat.repository"
import { requireStudentSession } from "@/lib/auth/session"

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authSession = await requireStudentSession()
    const { sessionId } = await context.params

    const session = await aiTutorChatRepository.findSessionForUser(
      authSession.sub,
      sessionId
    )

    if (!session) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authSession = await requireStudentSession()
    const { sessionId } = await context.params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const parsed = parseSyncAiTutorSession(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid session data." },
        { status: 400 }
      )
    }

    const updated = await aiTutorChatRepository.syncSessionMessages(
      authSession.sub,
      sessionId,
      parsed.data
    )

    if (!updated) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 })
    }

    return NextResponse.json({ session: updated })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authSession = await requireStudentSession()
    const { sessionId } = await context.params

    const deleted = await aiTutorChatRepository.deleteSessionForUser(
      authSession.sub,
      sessionId
    )

    if (!deleted) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}
