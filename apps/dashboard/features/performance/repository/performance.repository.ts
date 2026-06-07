import { prisma } from "@/lib/db"

import type {
  FocusChapter,
  PerformanceInsights,
  ReportCard,
  SubjectAccuracy,
  WeeklyAccuracyPoint,
} from "../model/performance-data"
import { subjectBarColors } from "../model/performance-data"
import { reportCardRepository } from "./report-card.repository"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

const PERFORMANCE_WEIGHTS = {
  quiz: 0.7,
  notes: 0.2,
  aiTutor: 0.1,
} as const

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

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

function getWeekRange(reference: Date, weekOffset: number) {
  const date = new Date(reference)
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = startOfDay(date)
  monday.setDate(monday.getDate() + mondayOffset + weekOffset * 7)

  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday)
    next.setDate(monday.getDate() + index)
    return next
  })
}

function computeWeightedScore(
  signals: Array<{ value: number; weight: number }>
) {
  if (signals.length === 0) return null

  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0)
  const weightedSum = signals.reduce(
    (sum, signal) => sum + signal.value * signal.weight,
    0
  )

  return Math.round(weightedSum / totalWeight)
}

function accuracyTier(value: number): SubjectAccuracy["tier"] {
  if (value >= 80) return "high"
  if (value >= 65) return "medium"
  return "low"
}

type DailyActivity = {
  quizScores: number[]
  notesViewed: number
  notesCompleted: number
  aiTutorMessages: number
}

function buildDailyActivityMap(
  attempts: Array<{ completedAt: Date; scorePercent: number }>,
  noteEvents: Array<{ lastViewedAt: Date; status: "VIEWED" | "COMPLETED" }>,
  aiMessages: Array<{ createdAt: Date }>
) {
  const map = new Map<string, DailyActivity>()

  const ensureDay = (key: string): DailyActivity => {
    const existing = map.get(key)
    if (existing) return existing

    const created: DailyActivity = {
      quizScores: [],
      notesViewed: 0,
      notesCompleted: 0,
      aiTutorMessages: 0,
    }
    map.set(key, created)
    return created
  }

  for (const attempt of attempts) {
    const bucket = ensureDay(dayKey(attempt.completedAt))
    bucket.quizScores.push(attempt.scorePercent)
  }

  for (const event of noteEvents) {
    const bucket = ensureDay(dayKey(event.lastViewedAt))
    bucket.notesViewed += 1
    if (event.status === "COMPLETED") {
      bucket.notesCompleted += 1
    }
  }

  for (const message of aiMessages) {
    const bucket = ensureDay(dayKey(message.createdAt))
    bucket.aiTutorMessages += 1
  }

  return map
}

function scoreForDay(activity: DailyActivity | undefined) {
  if (!activity) return null

  const signals: Array<{ value: number; weight: number }> = []

  if (activity.quizScores.length > 0) {
    const quizAverage =
      activity.quizScores.reduce((sum, score) => sum + score, 0) /
      activity.quizScores.length
    signals.push({ value: quizAverage, weight: PERFORMANCE_WEIGHTS.quiz })
  }

  if (activity.notesViewed > 0) {
    const completionRatio = activity.notesCompleted / activity.notesViewed
    const noteScore = Math.round(
      Math.min(100, 40 + completionRatio * 60 + activity.notesCompleted * 5)
    )
    signals.push({ value: noteScore, weight: PERFORMANCE_WEIGHTS.notes })
  }

  if (activity.aiTutorMessages > 0) {
    const engagementScore = Math.min(
      100,
      Math.round((activity.aiTutorMessages / 5) * 100)
    )
    signals.push({
      value: engagementScore,
      weight: PERFORMANCE_WEIGHTS.aiTutor,
    })
  }

  return computeWeightedScore(signals)
}

function averageScore(values: Array<number | null>) {
  const filtered = values.filter((value): value is number => value !== null)
  if (filtered.length === 0) return null
  return Math.round(
    filtered.reduce((sum, value) => sum + value, 0) / filtered.length
  )
}

export type PerformanceDashboardData = {
  weeklyAccuracyTrend: WeeklyAccuracyPoint[]
  weeklyAccuracyDeltaPercent: number
  subjectAccuracy: SubjectAccuracy[]
  performanceInsights: PerformanceInsights
  reportCard: ReportCard
  hasActivity: boolean
}

export class PerformanceRepository {
  async getDashboardForUser(
    userId: string,
    classId: string
  ): Promise<PerformanceDashboardData> {
    const now = new Date()
    const currentWeek = getWeekRange(now, 0)
    const previousWeek = getWeekRange(now, -1)
    const rangeStart = startOfDay(previousWeek[0]!)
    const rangeEnd = endOfDay(currentWeek[6]!)

    const [attempts, noteProgress, aiMessages, subjects] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: {
          userId,
          completedAt: { gte: rangeStart, lte: rangeEnd },
        },
        select: {
          scorePercent: true,
          completedAt: true,
          quiz: {
            select: {
              chapter: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  subject: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.noteProgress.findMany({
        where: {
          userId,
          lastViewedAt: { gte: rangeStart, lte: rangeEnd },
        },
        select: {
          status: true,
          lastViewedAt: true,
        },
      }),
      prisma.aiTutorChatMessage.findMany({
        where: {
          role: "USER",
          createdAt: { gte: rangeStart, lte: rangeEnd },
          session: { userId },
        },
        select: { createdAt: true },
      }),
      prisma.subject.findMany({
        where: { classId },
        orderBy: { orderIndex: "asc" },
        select: { id: true, title: true, slug: true },
      }),
    ])

    const dailyActivity = buildDailyActivityMap(
      attempts,
      noteProgress,
      aiMessages
    )

    const weeklyAccuracyTrend: WeeklyAccuracyPoint[] = currentWeek.map(
      (date) => ({
        day: DAY_LABELS[date.getDay()] ?? "Mon",
        value: scoreForDay(dailyActivity.get(dayKey(date))),
      })
    )

    const currentWeekScores = currentWeek.map((date) =>
      scoreForDay(dailyActivity.get(dayKey(date)))
    )
    const previousWeekScores = previousWeek.map((date) =>
      scoreForDay(dailyActivity.get(dayKey(date)))
    )

    const currentAverage = averageScore(currentWeekScores)
    const previousAverage = averageScore(previousWeekScores)
    const weeklyAccuracyDeltaPercent =
      currentAverage !== null && previousAverage !== null
        ? currentAverage - previousAverage
        : 0

    const allAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: {
        scorePercent: true,
        quiz: {
          select: {
            chapter: {
              select: {
                id: true,
                title: true,
                slug: true,
                subject: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const subjectScoreMap = new Map<string, { total: number; count: number }>()

    for (const attempt of allAttempts) {
      const subjectId = attempt.quiz.chapter.subject.id
      const current = subjectScoreMap.get(subjectId) ?? { total: 0, count: 0 }
      current.total += attempt.scorePercent
      current.count += 1
      subjectScoreMap.set(subjectId, current)
    }

    const subjectAccuracy: SubjectAccuracy[] = subjects.map((subject) => {
      const stats = subjectScoreMap.get(subject.id)
      const value =
        stats && stats.count > 0 ? Math.round(stats.total / stats.count) : 0

      return {
        subjectId: subject.id,
        subject: subject.title,
        value,
        tier: stats && stats.count > 0 ? accuracyTier(value) : "low",
      }
    })

    const rankedSubjects = subjectAccuracy
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)

    const strengthSubject = rankedSubjects[0]
    const needsImprovementSubject = rankedSubjects[rankedSubjects.length - 1]

    const chapterScoreMap = new Map<
      string,
      {
        total: number
        count: number
        chapterTitle: string
        subjectSlug: string
        chapterSlug: string
      }
    >()

    for (const attempt of allAttempts) {
      const chapter = attempt.quiz.chapter
      const key = chapter.id
      const current = chapterScoreMap.get(key) ?? {
        total: 0,
        count: 0,
        chapterTitle: chapter.title,
        subjectSlug: chapter.subject.slug,
        chapterSlug: chapter.slug,
      }
      current.total += attempt.scorePercent
      current.count += 1
      chapterScoreMap.set(key, current)
    }

    const weakSubjectSlug = needsImprovementSubject
      ? subjects.find(
          (subject) => subject.title === needsImprovementSubject.subject
        )?.slug
      : null

    const focusChapters: FocusChapter[] = [...chapterScoreMap.entries()]
      .map(([id, stats]) => ({
        id,
        label: `Ch: ${stats.chapterTitle}`,
        href: `/subjects/${stats.subjectSlug}/${stats.chapterSlug}`,
        average: Math.round(stats.total / stats.count),
        subjectSlug: stats.subjectSlug,
      }))
      .filter((chapter) =>
        weakSubjectSlug ? chapter.href.includes(weakSubjectSlug) : true
      )
      .sort((a, b) => a.average - b.average)
      .slice(0, 2)
      .map(({ id, label, href }) => ({ id, label, href }))

    const performanceInsights: PerformanceInsights = {
      strength: {
        label: "STRENGTH",
        subject: strengthSubject?.subject ?? "—",
      },
      needsImprovement: {
        label: "NEEDS IMPROVEMENT",
        subject: needsImprovementSubject?.subject ?? "—",
      },
      tip:
        strengthSubject && needsImprovementSubject
          ? `You're performing well in ${strengthSubject.subject}. Focus more on ${needsImprovementSubject.subject} to improve your overall score.`
          : "Complete quizzes and lessons to unlock personalized performance insights.",
      focusChapters,
    }

    const hasActivity =
      attempts.length > 0 ||
      noteProgress.length > 0 ||
      aiMessages.length > 0 ||
      allAttempts.length > 0

    const reportCard = await reportCardRepository.getReportCardForUser(
      userId,
      classId
    )

    return {
      weeklyAccuracyTrend,
      weeklyAccuracyDeltaPercent,
      subjectAccuracy,
      performanceInsights,
      reportCard,
      hasActivity,
    }
  }
}

export { subjectBarColors }

export const performanceRepository = new PerformanceRepository()
