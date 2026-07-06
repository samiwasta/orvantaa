import { cache } from "react"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import type { GoalsPageData } from "@/features/goals/model/student-goal"
import { goalService } from "@/features/goals/service/goal.service"
import { requireStudentSession } from "@/lib/auth/session"

const emptyGoalsPageData: GoalsPageData = {
  examTarget: null,
  activeGoals: [],
  completedGoals: [],
  daysUntilExam: null,
  syllabusSummary: { completedChapters: 0, totalChapters: 0 },
  journey: { activeSteps: 0, completedSteps: 0, overallPercent: 0 },
}

export const loadGoalsPageForCurrentStudent = cache(
  async (): Promise<GoalsPageData> => {
    const session = await requireStudentSession()
    const classId = await loadStudentClassId()
    if (!classId) return emptyGoalsPageData

    return goalService.getGoalsPageData(session.sub, classId)
  }
)
