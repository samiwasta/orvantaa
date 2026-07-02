import {
  chapterWithAssignedContentWhere,
  quizWithQuestionsWhere,
  subjectWithAssignedContentWhere,
  topicWithNotesWhere,
} from "@/features/curriculum/model/assigned-content-filters"
import { resolveChapterProgress } from "@/features/curriculum/model/chapter-progress"
import {
  chapterHref,
  quizHref,
} from "@/features/subjects/model/content-navigation"
import { prisma } from "@/lib/db"

import type {
  ActiveLearnerDashboardData,
  DashboardActionCard,
  DashboardPerformanceInsights,
} from "../model/active-learner-dashboard-data"

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

function formatTimeSpent(totalSeconds: number) {
  if (totalSeconds <= 0) return "0m"

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function gradePaceLabel(accuracy: number | null): string {
  if (accuracy === null) return "Start Strong"
  if (accuracy >= 90) return "A+ Grade Pace"
  if (accuracy >= 80) return "A Grade Pace"
  if (accuracy >= 70) return "B Grade Pace"
  if (accuracy >= 60) return "C Grade Pace"
  return "Keep Practicing"
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

export class ActiveLearnerDashboardRepository {
  async getDashboardData(
    userId: string,
    classId: string
  ): Promise<ActiveLearnerDashboardData | null> {
    if (!classId) return null

    const [chapters, noteProgressRows, quizAttempts, quizAttemptsDetailed] =
      await Promise.all([
        prisma.chapter.findMany({
          where: {
            ...chapterWithAssignedContentWhere,
            subject: {
              classId,
              ...subjectWithAssignedContentWhere,
            },
          },
          orderBy: [{ subject: { orderIndex: "asc" } }, { number: "asc" }],
          select: {
            title: true,
            slug: true,
            number: true,
            subject: {
              select: {
                title: true,
                slug: true,
              },
            },
            topics: {
              where: topicWithNotesWhere,
              orderBy: { orderIndex: "asc" },
              select: {
                slug: true,
                notes: {
                  orderBy: { orderIndex: "asc" },
                  select: { id: true },
                },
              },
            },
            quizzes: {
              where: quizWithQuestionsWhere,
              orderBy: { orderIndex: "asc" },
              select: { id: true },
            },
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
        prisma.quizAttempt.findMany({
          where: { userId },
          select: {
            quizId: true,
            scorePercent: true,
            completedAt: true,
            timeSpentSeconds: true,
          },
          orderBy: { completedAt: "desc" },
        }),
        prisma.quizAttempt.findMany({
          where: { userId },
          select: {
            scorePercent: true,
            quiz: {
              select: {
                chapter: {
                  select: {
                    title: true,
                    slug: true,
                    subject: {
                      select: {
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
      ])

    const progressByNoteId = new Map(
      noteProgressRows.map((row) => [row.noteId, row.status])
    )
    const completedQuizIds = new Set(
      quizAttempts.map((attempt) => attempt.quizId)
    )

    const currentLesson = this.resolveCurrentLesson(
      chapters,
      progressByNoteId,
      completedQuizIds
    )
    if (!currentLesson) return null

    const actionCards = this.buildActionCards(
      chapters,
      progressByNoteId,
      currentLesson,
      quizAttemptsDetailed
    )

    const performanceInsights = this.resolvePerformanceInsights(
      quizAttemptsDetailed,
      currentLesson
    )

    const activityDays = new Set<string>()
    for (const row of noteProgressRows) {
      activityDays.add(dayKey(row.lastViewedAt))
    }
    for (const attempt of quizAttempts) {
      activityDays.add(dayKey(attempt.completedAt))
    }

    const accuracy =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce(
              (sum, attempt) => sum + attempt.scorePercent,
              0
            ) / quizAttempts.length
          )
        : null

    const totalTimeSpentSeconds = quizAttempts.reduce(
      (sum, attempt) => sum + (attempt.timeSpentSeconds ?? 0),
      0
    )

    const streak = computeStudyStreak(activityDays)

    return {
      currentLesson,
      performance: {
        gradePaceLabel: gradePaceLabel(accuracy),
        stats: [
          {
            label: "Accuracy",
            value: accuracy === null ? "—" : `${accuracy}%`,
            tone: "purple",
          },
          {
            label: "Tests Taken",
            value: String(quizAttempts.length),
            tone: "orange",
          },
          {
            label: "Study Streak",
            value: streak > 0 ? `${streak} days` : "0 days",
            tone: "amber",
          },
          {
            label: "Time Spent",
            value: formatTimeSpent(totalTimeSpentSeconds),
            tone: "teal",
          },
        ],
      },
      actionCards,
      performanceInsights,
    }
  }

  private resolvePerformanceInsights(
    attempts: Array<{
      scorePercent: number
      quiz: {
        chapter: {
          title: string
          slug: string
          subject: { title: string; slug: string }
        }
      }
    }>,
    fallback: {
      subjectTitle: string
      chapterTitle: string
    }
  ): DashboardPerformanceInsights {
    const grouped = new Map<
      string,
      { total: number; count: number; chapterTitle: string }
    >()

    for (const attempt of attempts) {
      const chapter = attempt.quiz.chapter
      const key = `${chapter.subject.slug}/${chapter.slug}`
      const current = grouped.get(key) ?? {
        total: 0,
        count: 0,
        chapterTitle: chapter.title,
      }
      current.total += attempt.scorePercent
      current.count += 1
      grouped.set(key, current)
    }

    let strongest: { average: number; chapterTitle: string } | null = null
    let weakest: { average: number; chapterTitle: string } | null = null

    for (const entry of grouped.values()) {
      if (entry.count === 0) continue
      const average = entry.total / entry.count

      if (!strongest || average > strongest.average) {
        strongest = { average, chapterTitle: entry.chapterTitle }
      }

      if (!weakest || average < weakest.average) {
        weakest = { average, chapterTitle: entry.chapterTitle }
      }
    }

    if (strongest && strongest.chapterTitle === weakest?.chapterTitle) {
      weakest = null
    }

    const strengthSubject = strongest?.chapterTitle ?? fallback.subjectTitle
    const growthSubject = weakest?.chapterTitle ?? fallback.chapterTitle

    const tip =
      weakest !== null
        ? `Based on your recent performance, focusing on ${weakest.chapterTitle} concepts can significantly boost your overall score.`
        : strongest !== null
          ? `You're performing well in ${strongest.chapterTitle}. Keep practicing to maintain your momentum.`
          : "Complete quizzes and lessons to unlock personalized performance insights."

    return {
      strength: {
        label: "STRENGTH",
        subject: strengthSubject,
      },
      growthArea: {
        label: "GROWTH AREA",
        subject: growthSubject,
      },
      tip,
    }
  }

  private buildActionCards(
    chapters: Array<{
      title: string
      slug: string
      subject: { title: string; slug: string }
      topics: Array<{ notes: Array<{ id: string }> }>
      quizzes: Array<{ id: string }>
    }>,
    progressByNoteId: Map<string, "VIEWED" | "COMPLETED">,
    currentLesson: {
      subjectTitle: string
      subjectSlug: string
      chapterSlug: string
      chapterTitle: string
      continueHref: string
      quizId: string | null
    },
    quizAttemptsDetailed: Array<{
      scorePercent: number
      quiz: {
        chapter: {
          title: string
          slug: string
          subject: { title: string; slug: string }
        }
      }
    }>
  ): DashboardActionCard[] {
    let incompleteChapters = 0
    for (const chapter of chapters) {
      const noteIds = chapter.topics.flatMap((topic) =>
        topic.notes.map((note) => note.id)
      )
      if (noteIds.length === 0) continue

      const completed = noteIds.filter(
        (noteId) => progressByNoteId.get(noteId) === "COMPLETED"
      ).length

      if (completed < noteIds.length) {
        incompleteChapters += 1
      }
    }

    const goalCount = Math.max(1, Math.min(2, incompleteChapters || 2))

    const quizHrefValue =
      currentLesson.quizId !== null
        ? quizHref(
            currentLesson.subjectSlug,
            currentLesson.chapterSlug,
            currentLesson.quizId
          )
        : chapterHref(currentLesson.subjectSlug, currentLesson.chapterSlug)

    const weakArea = this.resolveWeakArea(quizAttemptsDetailed, currentLesson)

    return [
      {
        badge: "Based on your progress",
        title: `Take ${currentLesson.subjectTitle} Quiz`,
        buttonLabel: "Start",
        href: quizHrefValue,
        imageSrc: "/quiz.svg",
        imageAlt: "Quiz illustration",
        variant: "purple",
      },
      {
        badge: "Today's Goal",
        title: `Complete ${goalCount} chapter${goalCount === 1 ? "" : "s"}`,
        buttonLabel: "Start Now",
        href: currentLesson.continueHref,
        imageSrc: "/open-book.svg",
        imageAlt: "Book illustration",
        variant: "white",
      },
      {
        badge: "Weak area in recent tests",
        title: weakArea.title,
        buttonLabel: "Start",
        href: weakArea.href,
        imageSrc: "/graph.svg",
        imageAlt: "Calculator illustration",
        variant: "blue",
      },
    ]
  }

  private resolveWeakArea(
    attempts: Array<{
      scorePercent: number
      quiz: {
        chapter: {
          title: string
          slug: string
          subject: { title: string; slug: string }
        }
      }
    }>,
    fallback: {
      subjectSlug: string
      chapterSlug: string
      chapterTitle: string
    }
  ) {
    const grouped = new Map<
      string,
      { total: number; count: number; chapterTitle: string; href: string }
    >()

    for (const attempt of attempts) {
      const chapter = attempt.quiz.chapter
      const key = `${chapter.subject.slug}/${chapter.slug}`
      const current = grouped.get(key) ?? {
        total: 0,
        count: 0,
        chapterTitle: chapter.title,
        href: chapterHref(chapter.subject.slug, chapter.slug),
      }
      current.total += attempt.scorePercent
      current.count += 1
      grouped.set(key, current)
    }

    let weakest: {
      average: number
      chapterTitle: string
      href: string
    } | null = null

    for (const entry of grouped.values()) {
      if (entry.count === 0) continue
      const average = entry.total / entry.count
      if (!weakest || average < weakest.average) {
        weakest = {
          average,
          chapterTitle: entry.chapterTitle,
          href: entry.href,
        }
      }
    }

    if (weakest) {
      return {
        title: `Revise ${weakest.chapterTitle}`,
        href: weakest.href,
      }
    }

    return {
      title: `Revise ${fallback.chapterTitle}`,
      href: chapterHref(fallback.subjectSlug, fallback.chapterSlug),
    }
  }

  private resolveCurrentLesson(
    chapters: Array<{
      title: string
      slug: string
      number: number
      subject: { title: string; slug: string }
      topics: Array<{
        slug: string
        notes: Array<{ id: string }>
      }>
      quizzes: Array<{ id: string }>
    }>,
    progressByNoteId: Map<string, "VIEWED" | "COMPLETED">,
    completedQuizIds: Set<string>
  ) {
    for (const chapter of chapters) {
      const progress = resolveChapterProgress(
        chapter,
        progressByNoteId,
        completedQuizIds
      )

      if (progress.totalItems === 0) continue
      if (progress.isCompleted) continue

      return {
        subjectTitle: chapter.subject.title,
        subjectSlug: chapter.subject.slug,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        chapterLabel: `Chapter ${chapter.number}: ${chapter.title}`,
        completedItems: progress.completedItems,
        totalItems: progress.totalItems,
        progressPercent: progress.progressPercent,
        isCompleted: false,
        continueHref: chapterHref(chapter.subject.slug, chapter.slug),
        quizId: chapter.quizzes[0]?.id ?? null,
      }
    }

    const reviseChapter = [...chapters].reverse().find((chapter) => {
      const progress = resolveChapterProgress(
        chapter,
        progressByNoteId,
        completedQuizIds
      )
      return progress.totalItems > 0 && progress.isCompleted
    })

    if (reviseChapter) {
      const progress = resolveChapterProgress(
        reviseChapter,
        progressByNoteId,
        completedQuizIds
      )

      return {
        subjectTitle: reviseChapter.subject.title,
        subjectSlug: reviseChapter.subject.slug,
        chapterSlug: reviseChapter.slug,
        chapterTitle: reviseChapter.title,
        chapterLabel: `Chapter ${reviseChapter.number}: ${reviseChapter.title}`,
        completedItems: progress.completedItems,
        totalItems: progress.totalItems,
        progressPercent: progress.progressPercent,
        isCompleted: true,
        continueHref: chapterHref(
          reviseChapter.subject.slug,
          reviseChapter.slug
        ),
        quizId: reviseChapter.quizzes[0]?.id ?? null,
      }
    }

    const firstChapter = chapters.find((chapter) =>
      chapter.topics.some((topic) => topic.notes.length > 0)
    )

    if (!firstChapter) return null

    const firstTopic = firstChapter.topics.find(
      (topic) => topic.notes.length > 0
    )
    if (!firstTopic?.notes[0]) return null

    const continueHref = chapterHref(
      firstChapter.subject.slug,
      firstChapter.slug
    )

    const progress = resolveChapterProgress(
      firstChapter,
      progressByNoteId,
      completedQuizIds
    )

    return {
      subjectTitle: firstChapter.subject.title,
      subjectSlug: firstChapter.subject.slug,
      chapterSlug: firstChapter.slug,
      chapterTitle: firstChapter.title,
      chapterLabel: `Chapter ${firstChapter.number}: ${firstChapter.title}`,
      completedItems: progress.completedItems,
      totalItems: progress.totalItems,
      progressPercent: progress.progressPercent,
      isCompleted: false,
      continueHref,
      quizId: firstChapter.quizzes[0]?.id ?? null,
    }
  }
}

export const activeLearnerDashboardRepository =
  new ActiveLearnerDashboardRepository()
