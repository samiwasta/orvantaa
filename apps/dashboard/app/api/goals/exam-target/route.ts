import { NextResponse } from "next/server"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { parseUpsertExamTarget } from "@/features/goals/model/goal-request"
import { studentGoalRepository } from "@/features/goals/repository/student-goal.repository"
import { goalService } from "@/features/goals/service/goal.service"
import { requireStudentSession } from "@/lib/auth/session"

export async function PUT(request: Request) {
  try {
    const authSession = await requireStudentSession()
    const classId = await loadStudentClassId()
    if (!classId) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const parsed = parseUpsertExamTarget(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid exam target." },
        { status: 400 }
      )
    }

    const examDate = new Date(parsed.data.examDate)
    if (Number.isNaN(examDate.getTime())) {
      return NextResponse.json({ error: "Invalid exam date." }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (examDate < today) {
      return NextResponse.json(
        { error: "Exam date must be today or in the future." },
        { status: 400 }
      )
    }

    await studentGoalRepository.upsertExamTarget(authSession.sub, {
      examName: parsed.data.examName,
      examDate,
    })

    const data = await goalService.getGoalsPageData(authSession.sub, classId, {
      forceRegenerate: true,
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}
