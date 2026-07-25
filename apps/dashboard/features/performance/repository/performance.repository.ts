import {
  chapterWithAssignedContentWhere,
  quizWithQuestionsWhere,
  subjectWithAssignedContentWhere,
  topicWithNotesWhere,
} from "@/features/curriculum/model/assigned-content-filters"
import { resolveChapterProgress } from "@/features/curriculum/model/chapter-progress"
import { prisma } from "@/lib/db"

import type {
  FocusChapter,
  PerformanceInsights,
  ReportCard,
  SubjectAccuracy,
  WeeklyAccuracyPoint,
} from "../model/performance-data"
import { subjectBarColors } from "../model/performance-data"
import {
  buildPerformanceScorecard,
  computeWeightedScore,
  DAILY_PERFORMANCE_WEIGHTS,
  type DailyPerformancePoint,
  formatTimeSpent,
  type PerformanceScorecard,
  roundScore,
  scoreAiEngagement,
  scoreIntegrityPenalty,
  scoreLearningDepth,
  scoreStudyAttendance,
  scoreStudyStreak,
} from "../model/performance-score"
import { reportCardRepository } from "./report-card.repository"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
const LOOKBACK_DAYS = 28

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

function getDayRange(reference: Date, days: number) {
  const end = startOfDay(reference)
  return Array.from({ length: days }, (_, index) => {
    const next = new Date(end)
    next.setDate(end.getDate() - (days - 1 - index))
    return next
  })
}

function accuracyTier(value: number): SubjectAccuracy["tier"] {
  if (value >= 80) return "high"
  if (value >= 65) return "medium"
  return "low"
}

function computeStudyStreak(activityDays: Set<string>) {
  let streak = 0
  const cursor = startOfDay(new Date())

  while (activityDays.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
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

function daySignalScores(activity: DailyActivity | undefined) {
  if (!activity) {
    return { quiz: null, notes: null, ai: null, composite: null }
  }

  let quiz: number | null = null
  let notes: number | null = null
  let ai: number | null = null

  if (activity.quizScores.length > 0) {
    quiz = roundScore(
      activity.quizScores.reduce((sum, score) => sum + score, 0) /
        activity.quizScores.length
    )
  }

  if (activity.notesViewed > 0) {
    const completionRatio = activity.notesCompleted / activity.notesViewed
    notes = roundScore(
      Math.min(100, 40 + completionRatio * 60 + activity.notesCompleted * 5)
    )
  }

  if (activity.aiTutorMessages > 0) {
    ai = roundScore(Math.min(100, (activity.aiTutorMessages / 5) * 100))
  }

  const signals: Array<{ value: number; weight: number }> = []
  if (quiz !== null) {
    signals.push({ value: quiz, weight: DAILY_PERFORMANCE_WEIGHTS.quiz })
  }
  if (notes !== null) {
    signals.push({ value: notes, weight: DAILY_PERFORMANCE_WEIGHTS.notes })
  }
  if (ai !== null) {
    signals.push({ value: ai, weight: DAILY_PERFORMANCE_WEIGHTS.aiTutor })
  }

  return {
    quiz,
    notes,
    ai,
    composite: computeWeightedScore(signals),
  }
}

function averageScore(values: Array<number | null>) {
  const filtered = values.filter((value): value is number => value !== null)
  if (filtered.length === 0) return null
  return roundScore(
    filtered.reduce((sum, value) => sum + value, 0) / filtered.length
  )
}

export type PerformanceDashboardData = {
  scorecard: PerformanceScorecard
  weeklyAccuracyTrend: WeeklyAccuracyPoint[]
  dailyPerformanceTrend: DailyPerformancePoint[]
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
    const lookbackDays = getDayRange(now, LOOKBACK_DAYS)
    const rangeStart = startOfDay(
      previousWeek[0]! < lookbackDays[0]! ? previousWeek[0]! : lookbackDays[0]!
    )
    const rangeEnd = endOfDay(lookbackDays[lookbackDays.length - 1]!)

    const [
      recentAttempts,
      allAttempts,
      recentNoteProgress,
      allNoteProgress,
      recentAiMessages,
      subjects,
      chapters,
    ] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: {
          userId,
          completedAt: { gte: rangeStart, lte: rangeEnd },
        },
        select: {
          scorePercent: true,
          correctCount: true,
          totalQuestions: true,
          answeredCount: true,
          timeSpentSeconds: true,
          proctorWarnings: true,
          terminatedByProctor: true,
          completedAt: true,
          quizId: true,
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
      prisma.quizAttempt.findMany({
        where: { userId },
        select: {
          scorePercent: true,
          correctCount: true,
          totalQuestions: true,
          answeredCount: true,
          timeSpentSeconds: true,
          proctorWarnings: true,
          terminatedByProctor: true,
          completedAt: true,
          quizId: true,
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
      prisma.noteProgress.findMany({
        where: { userId },
        select: {
          noteId: true,
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
      classId
        ? prisma.chapter.findMany({
            where: {
              ...chapterWithAssignedContentWhere,
              subject: {
                classId,
                ...subjectWithAssignedContentWhere,
              },
            },
            select: {
              id: true,
              topics: {
                where: topicWithNotesWhere,
                select: {
                  notes: {
                    select: { id: true },
                  },
                },
              },
              quizzes: {
                where: quizWithQuestionsWhere,
                select: { id: true },
              },
            },
          })
        : Promise.resolve([]),
    ])

    const lookbackAttempts = recentAttempts.filter(
      (attempt) => attempt.completedAt >= rangeStart
    )
    const lookbackNotes = recentNoteProgress.filter(
      (row) => row.lastViewedAt >= rangeStart
    )
    const lookbackAi = recentAiMessages.filter(
      (message) => message.createdAt >= rangeStart
    )

    const dailyActivity = buildDailyActivityMap(
      recentAttempts,
      recentNoteProgress,
      recentAiMessages
    )

    const weeklyAccuracyTrend: WeeklyAccuracyPoint[] = currentWeek.map(
      (date) => ({
        day: DAY_LABELS[date.getDay()] ?? "Mon",
        value: daySignalScores(dailyActivity.get(dayKey(date))).composite,
      })
    )

    const dailyPerformanceTrend: DailyPerformancePoint[] = lookbackDays.map(
      (date) => {
        const scores = daySignalScores(dailyActivity.get(dayKey(date)))
        return {
          day: DAY_LABELS[date.getDay()] ?? "Mon",
          dateKey: dayKey(date),
          value: scores.composite,
          quiz: scores.quiz,
          notes: scores.notes,
          ai: scores.ai,
        }
      }
    )

    const currentWeekScores = currentWeek.map(
      (date) => daySignalScores(dailyActivity.get(dayKey(date))).composite
    )
    const previousWeekScores = previousWeek.map(
      (date) => daySignalScores(dailyActivity.get(dayKey(date))).composite
    )

    const currentAverage = averageScore(currentWeekScores)
    const previousAverage = averageScore(previousWeekScores)
    const weeklyAccuracyDeltaPercent =
      currentAverage !== null && previousAverage !== null
        ? currentAverage - previousAverage
        : 0

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

    const rankedFocusChapters = [...chapterScoreMap.entries()]
      .map(([id, stats]) => ({
        id,
        label: stats.chapterTitle,
        href: `/subjects/${stats.subjectSlug}/${stats.chapterSlug}`,
        average: Math.round(stats.total / stats.count),
        subjectSlug: stats.subjectSlug,
      }))
      .sort((a, b) => a.average - b.average)

    const weakSubjectChapters = weakSubjectSlug
      ? rankedFocusChapters.filter(
          (chapter) => chapter.subjectSlug === weakSubjectSlug
        )
      : []

    const otherChapters = weakSubjectSlug
      ? rankedFocusChapters.filter(
          (chapter) => chapter.subjectSlug !== weakSubjectSlug
        )
      : rankedFocusChapters

    const focusChapters: FocusChapter[] = [
      ...weakSubjectChapters,
      ...otherChapters,
    ]
      .slice(0, 6)
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

    const activityDays = new Set<string>()
    for (const row of allNoteProgress) {
      activityDays.add(dayKey(row.lastViewedAt))
    }
    for (const attempt of allAttempts) {
      activityDays.add(dayKey(attempt.completedAt))
    }
    for (const message of recentAiMessages) {
      activityDays.add(dayKey(message.createdAt))
    }

    const lookbackActivityDays = new Set<string>()
    for (const date of lookbackDays) {
      const key = dayKey(date)
      const activity = dailyActivity.get(key)
      if (
        activity &&
        (activity.quizScores.length > 0 ||
          activity.notesViewed > 0 ||
          activity.aiTutorMessages > 0)
      ) {
        lookbackActivityDays.add(key)
      }
    }

    const studyStreak = computeStudyStreak(activityDays)
    const accuracy =
      allAttempts.length > 0
        ? roundScore(
            allAttempts.reduce(
              (sum, attempt) => sum + attempt.scorePercent,
              0
            ) / allAttempts.length
          )
        : null

    const answeredTotals = allAttempts.reduce(
      (acc, attempt) => {
        const answered =
          attempt.answeredCount > 0
            ? attempt.answeredCount
            : attempt.totalQuestions
        acc.answered += answered
        acc.total += attempt.totalQuestions
        return acc
      },
      { answered: 0, total: 0 }
    )
    const answerCompletionRate =
      answeredTotals.total > 0
        ? roundScore((answeredTotals.answered / answeredTotals.total) * 100)
        : null

    const notesCompletedLast28 = lookbackNotes.filter(
      (row) => row.status === "COMPLETED"
    ).length

    const progressByNoteId = new Map(
      allNoteProgress.map((row) => [row.noteId, row.status])
    )
    const completedQuizIds = new Set(
      allAttempts.map((attempt) => attempt.quizId)
    )

    let completedChapters = 0
    for (const chapter of chapters) {
      if (
        resolveChapterProgress(chapter, progressByNoteId, completedQuizIds)
          .isCompleted
      ) {
        completedChapters += 1
      }
    }

    const syllabus =
      chapters.length > 0
        ? roundScore((completedChapters / chapters.length) * 100)
        : null

    const totalTimeSpentSeconds = allAttempts.reduce(
      (sum, attempt) => sum + (attempt.timeSpentSeconds ?? 0),
      0
    )

    const integrityPenalty = scoreIntegrityPenalty({
      averageWarnings:
        allAttempts.length > 0
          ? allAttempts.reduce(
              (sum, attempt) => sum + attempt.proctorWarnings,
              0
            ) / allAttempts.length
          : 0,
      terminatedAttempts: allAttempts.filter(
        (attempt) => attempt.terminatedByProctor
      ).length,
      totalAttempts: allAttempts.length,
    })

    const scorecard = buildPerformanceScorecard({
      accuracy,
      attendance: scoreStudyAttendance(
        lookbackActivityDays.size,
        LOOKBACK_DAYS
      ),
      streakScore: scoreStudyStreak(studyStreak),
      syllabus,
      learningDepth: scoreLearningDepth({
        notesCompletedLast28Days: notesCompletedLast28,
        quizzesTakenLast28Days: lookbackAttempts.length,
        answerCompletionRate,
      }),
      aiEngagement: scoreAiEngagement(lookbackAi.length),
      integrityPenalty,
      stats: [
        {
          key: "accuracy",
          label: "Accuracy",
          value: accuracy === null ? "—" : `${accuracy}%`,
          hint: `${allAttempts.length} quiz attempts`,
        },
        {
          key: "attendance",
          label: "Attendance",
          value: `${lookbackActivityDays.size}/${LOOKBACK_DAYS}`,
          hint: "Active days · last 28 days",
        },
        {
          key: "streak",
          label: "Streak",
          value: studyStreak > 0 ? `${studyStreak}d` : "0d",
          hint: "Consecutive study days",
        },
        {
          key: "syllabus",
          label: "Syllabus",
          value:
            chapters.length > 0
              ? `${completedChapters}/${chapters.length}`
              : "—",
          hint: "Chapters completed",
        },
        {
          key: "ai",
          label: "AI prompts",
          value: String(lookbackAi.length),
          hint: "Orvantaa AI · last 28 days",
        },
        {
          key: "time",
          label: "Quiz time",
          value: formatTimeSpent(totalTimeSpentSeconds),
          hint: "Total timed quiz practice",
        },
      ],
    })

    const hasActivity =
      allAttempts.length > 0 ||
      allNoteProgress.length > 0 ||
      recentAiMessages.length > 0

    const reportCard = await reportCardRepository.getReportCardForUser(
      userId,
      classId
    )

    return {
      scorecard,
      weeklyAccuracyTrend,
      dailyPerformanceTrend,
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
