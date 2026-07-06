import {
  enrichGoalDraft,
  goalProgressPercent,
  hydrateGoalMetadata,
} from "../model/goal-instructions"
import type { GoalsPageData, StudentGoal } from "../model/student-goal"
import { goalContextRepository } from "../repository/goal-context.repository"
import { studentGoalRepository } from "../repository/student-goal.repository"
import { generateStudentGoals } from "../service/goal-generation.service"

function hydrateGoals(
  goals: StudentGoal[],
  context: Awaited<ReturnType<typeof goalContextRepository.build>>
) {
  return goals.map((goal) => {
    const enriched = enrichGoalDraft(
      {
        type: goal.type,
        title: goal.title,
        description: goal.description ?? undefined,
        rationale: goal.rationale ?? undefined,
        targetCount: goal.targetCount,
        periodDays: 1,
        href: goal.href ?? undefined,
        metadata: goal.metadata ?? undefined,
      },
      context
    )

    return {
      ...goal,
      title: enriched.title,
      description: enriched.description ?? goal.description,
      rationale: enriched.rationale ?? goal.rationale,
      href: enriched.href ?? goal.href,
      metadata:
        enriched.metadata ??
        hydrateGoalMetadata(goal, context) ??
        goal.metadata,
    }
  })
}

function buildJourneySummary(
  activeGoals: StudentGoal[],
  completedGoals: StudentGoal[],
  syllabusSummary: GoalsPageData["syllabusSummary"]
) {
  const activeProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce(
            (sum, goal) => sum + goalProgressPercent(goal),
            0
          ) / activeGoals.length
        )
      : 0

  const syllabusPercent =
    syllabusSummary.totalChapters > 0
      ? Math.round(
          (syllabusSummary.completedChapters / syllabusSummary.totalChapters) *
            100
        )
      : 0

  return {
    activeSteps: activeGoals.length,
    completedSteps: completedGoals.length,
    overallPercent: Math.round(activeProgress * 0.6 + syllabusPercent * 0.4),
  }
}

export class GoalService {
  async ensureGoals(userId: string, classId: string, force = false) {
    const context = await goalContextRepository.build(userId, classId)

    await studentGoalRepository.expireStaleGoals(userId)
    await studentGoalRepository.reconcileProgress(userId, context)

    const shouldRegenerate =
      force || (await studentGoalRepository.shouldRegenerate(userId))

    if (shouldRegenerate) {
      const { goals, source } = await generateStudentGoals(context)
      if (goals.length > 0) {
        await studentGoalRepository.replaceActiveGoals(userId, goals, source)
        await studentGoalRepository.reconcileProgress(userId, context)
      }
    }
  }

  async getGoalsPageData(
    userId: string,
    classId: string,
    options?: { forceRegenerate?: boolean }
  ): Promise<GoalsPageData> {
    await this.ensureGoals(userId, classId, options?.forceRegenerate ?? false)

    const [examTarget, goals, context] = await Promise.all([
      studentGoalRepository.getExamTarget(userId),
      studentGoalRepository.listGoals(userId),
      goalContextRepository.build(userId, classId),
    ])

    const activeGoals = hydrateGoals(
      goals.filter((goal) => goal.status === "ACTIVE"),
      context
    )
    const completedGoals = hydrateGoals(
      goals.filter((goal) => goal.status === "COMPLETED").slice(0, 8),
      context
    )

    const syllabusSummary = {
      completedChapters: context.syllabus.completedChapters,
      totalChapters: context.syllabus.totalChapters,
    }

    return {
      examTarget,
      activeGoals,
      completedGoals,
      daysUntilExam: context.daysUntilExam,
      syllabusSummary,
      journey: buildJourneySummary(
        activeGoals,
        completedGoals,
        syllabusSummary
      ),
    }
  }

  async getPrimaryGoal(userId: string, classId: string) {
    await this.ensureGoals(userId, classId)
    const [goals, context] = await Promise.all([
      studentGoalRepository.listGoals(userId),
      goalContextRepository.build(userId, classId),
    ])
    const primary = goals.find((goal) => goal.status === "ACTIVE")
    if (!primary) return null

    const [hydrated] = hydrateGoals([primary], context)
    return hydrated ?? null
  }

  async reconcileForUser(userId: string, classId: string) {
    const context = await goalContextRepository.build(userId, classId)
    await studentGoalRepository.expireStaleGoals(userId)
    await studentGoalRepository.reconcileProgress(userId, context)
  }
}

export const goalService = new GoalService()
