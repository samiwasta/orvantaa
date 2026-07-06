import { NextResponse } from "next/server"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { goalService } from "@/features/goals/service/goal.service"
import { notificationService } from "@/features/notifications/service/notification.service"
import { parseNoteProgress } from "@/features/performance/model/activity-request"
import { noteProgressRepository } from "@/features/performance/repository/note-progress.repository"
import { requireStudentSession } from "@/lib/auth/session"

type RouteContext = {
  params: Promise<{ noteId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authSession = await requireStudentSession()
    const classId = await loadStudentClassId()
    if (!classId) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 })
    }

    const { noteId } = await context.params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const parsed = parseNoteProgress(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid note progress." },
        { status: 400 }
      )
    }

    const access = await noteProgressRepository.verifyNoteAccess(
      authSession.sub,
      noteId,
      classId
    )
    if (!access) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 })
    }

    await noteProgressRepository.upsertProgress(
      authSession.sub,
      noteId,
      parsed.data.status
    )

    if (parsed.data.status === "COMPLETED") {
      await notificationService.notifyLessonCompletedFromNote(
        authSession.sub,
        noteId
      )
    }

    await goalService.reconcileForUser(authSession.sub, classId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}
