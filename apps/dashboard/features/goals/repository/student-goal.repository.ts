import type {
  StudentGoalSource,
  StudentGoalStatus,
  StudentGoalType,
} from "@prisma/client"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"

import type {
  GeneratedGoalDraft,
  StudentExamTarget,
  StudentGoal,
  StudentGoalMetadata,
} from "../model/student-goal"
import type { GoalGenerationContext } from "../repository/goal-context.repository"

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function parseMetadata(
  value: Prisma.JsonValue | null
): StudentGoalMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as StudentGoalMetadata
}

function mapGoal(row: {
  id: string
  type: StudentGoalType
  title: string
  description: string | null
  rationale: string | null
  targetCount: number
  progressCount: number
  status: StudentGoalStatus
  periodStart: Date
  periodEnd: Date
  priority: number
  href: string | null
  metadata: Prisma.JsonValue | null
  source: StudentGoalSource
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}): StudentGoal {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    rationale: row.rationale,
    targetCount: row.targetCount,
    progressCount: row.progressCount,
    status: row.status,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    priority: row.priority,
    href: row.href,
    metadata: parseMetadata(row.metadata),
    source: row.source,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt,
  }
}

function computeGoalProgress(
  goal: StudentGoal,
  context: GoalGenerationContext,
  quizAttemptsSince: Array<{ quizId: string; scorePercent: number }>
): number {
  const metadata = goal.metadata

  if (goal.type === "COMPLETE_CHAPTERS") {
    const chapterIds = metadata?.chapterIds ?? []
    return chapterIds.filter((id) => context.chapterById.get(id)?.isCompleted)
      .length
  }

  if (goal.type === "REVISE_CHAPTER" || goal.type === "IMPROVE_WEAK_AREA") {
    const chapterId = metadata?.chapterIds?.[0]
    const chapter = chapterId ? context.chapterById.get(chapterId) : null
    if (!chapter) return 0

    const minScore = metadata?.minQuizScore ?? 70
    const quizPassed = quizAttemptsSince.some(
      (attempt) =>
        metadata?.quizId &&
        attempt.quizId === metadata.quizId &&
        attempt.scorePercent >= minScore
    )

    if (quizPassed) return 1
    if (chapter.isCompleted) return 1
    if (chapter.noteCount > 0 && chapter.completedNotes === chapter.noteCount) {
      return 1
    }
    return 0
  }

  if (goal.type === "PASS_QUIZ") {
    const quizId = metadata?.quizId
    const minScore = metadata?.minQuizScore ?? 70
    if (!quizId) return 0
    return quizAttemptsSince.some(
      (attempt) => attempt.quizId === quizId && attempt.scorePercent >= minScore
    )
      ? 1
      : 0
  }

  if (goal.type === "MAINTAIN_STREAK") {
    return Math.min(context.performance.studyStreak, goal.targetCount)
  }

  return goal.progressCount
}

export class StudentGoalRepository {
  async getExamTarget(userId: string): Promise<StudentExamTarget | null> {
    const row = await prisma.studentExamTarget.findUnique({
      where: { userId },
    })
    if (!row) return null
    return { examName: row.examName, examDate: row.examDate }
  }

  async upsertExamTarget(
    userId: string,
    input: { examName: string; examDate: Date }
  ): Promise<StudentExamTarget> {
    const row = await prisma.studentExamTarget.upsert({
      where: { userId },
      create: {
        userId,
        examName: input.examName,
        examDate: input.examDate,
      },
      update: {
        examName: input.examName,
        examDate: input.examDate,
      },
    })

    return { examName: row.examName, examDate: row.examDate }
  }

  async listGoals(userId: string) {
    const rows = await prisma.studentGoal.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { periodEnd: "asc" }],
    })
    return rows.map(mapGoal)
  }

  async dismissGoal(userId: string, goalId: string) {
    const result = await prisma.studentGoal.updateMany({
      where: { id: goalId, userId, status: "ACTIVE" },
      data: { status: "DISMISSED" },
    })
    return result.count > 0
  }

  async expireStaleGoals(userId: string) {
    const now = new Date()
    await prisma.studentGoal.updateMany({
      where: {
        userId,
        status: "ACTIVE",
        periodEnd: { lt: now },
      },
      data: { status: "EXPIRED" },
    })
  }

  async reconcileProgress(userId: string, context: GoalGenerationContext) {
    const activeGoals = await prisma.studentGoal.findMany({
      where: { userId, status: "ACTIVE" },
    })

    if (activeGoals.length === 0) return

    const earliest = activeGoals.reduce(
      (min, goal) => (goal.periodStart < min ? goal.periodStart : min),
      activeGoals[0]!.periodStart
    )

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, completedAt: { gte: earliest } },
      select: { quizId: true, scorePercent: true },
    })

    for (const row of activeGoals) {
      const goal = mapGoal(row)
      const progressCount = computeGoalProgress(goal, context, attempts)
      const isComplete = progressCount >= goal.targetCount

      await prisma.studentGoal.update({
        where: { id: row.id },
        data: {
          progressCount,
          status: isComplete ? "COMPLETED" : "ACTIVE",
          completedAt: isComplete ? new Date() : null,
        },
      })
    }
  }

  async replaceActiveGoals(
    userId: string,
    drafts: GeneratedGoalDraft[],
    source: StudentGoalSource
  ) {
    const now = startOfDay(new Date())

    await prisma.$transaction(async (tx) => {
      await tx.studentGoal.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      })

      for (const draft of drafts) {
        const periodEnd = endOfDay(new Date(now))
        periodEnd.setDate(periodEnd.getDate() + draft.periodDays - 1)

        await tx.studentGoal.create({
          data: {
            userId,
            type: draft.type,
            title: draft.title,
            description: draft.description ?? null,
            rationale: draft.rationale ?? null,
            targetCount: draft.targetCount,
            progressCount: 0,
            status: "ACTIVE",
            periodStart: now,
            periodEnd,
            priority: draft.priority ?? 50,
            href: draft.href ?? null,
            metadata: draft.metadata ?? undefined,
            source,
          },
        })
      }
    })
  }

  async shouldRegenerate(userId: string) {
    const activeCount = await prisma.studentGoal.count({
      where: { userId, status: "ACTIVE" },
    })
    if (activeCount === 0) return true

    const latest = await prisma.studentGoal.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, status: true },
    })

    if (!latest) return true

    const ageHours =
      (Date.now() - latest.createdAt.getTime()) / (1000 * 60 * 60)
    return latest.status !== "ACTIVE" || ageHours >= 24
  }
}

export const studentGoalRepository = new StudentGoalRepository()
