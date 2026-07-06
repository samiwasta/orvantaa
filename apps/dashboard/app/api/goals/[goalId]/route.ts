import { NextResponse } from "next/server"

import { studentGoalRepository } from "@/features/goals/repository/student-goal.repository"
import { requireStudentSession } from "@/lib/auth/session"

type RouteContext = {
  params: Promise<{ goalId: string }>
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const authSession = await requireStudentSession()
    const { goalId } = await context.params

    const dismissed = await studentGoalRepository.dismissGoal(
      authSession.sub,
      goalId
    )

    if (!dismissed) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
}
