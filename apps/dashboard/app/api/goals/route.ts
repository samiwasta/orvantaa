import { NextResponse } from "next/server"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { goalService } from "@/features/goals/service/goal.service"
import { requireStudentSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const authSession = await requireStudentSession()
    const classId = await loadStudentClassId()
    if (!classId) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 })
    }

    const data = await goalService.getGoalsPageData(authSession.sub, classId)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}
