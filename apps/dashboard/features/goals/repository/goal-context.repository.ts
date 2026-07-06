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

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
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

export type GoalChapterContext = {
  id: string
  title: string
  subjectTitle: string
  subjectSlug: string
  chapterSlug: string
  progressPercent: number
  isCompleted: boolean
  hasQuiz: boolean
  quizId: string | null
  href: string
  noteCount: number
  completedNotes: number
}

export type GoalWeakArea = {
  chapterTitle: string
  subjectTitle: string
  subjectSlug: string
  chapterSlug: string
  averageScore: number
  href: string
  quizId: string | null
}

export type GoalGenerationContext = {
  studentName: string
  classId: string
  examTarget: { examName: string; examDate: Date } | null
  daysUntilExam: number | null
  syllabus: {
    completedChapters: number
    totalChapters: number
    incompleteChapters: GoalChapterContext[]
    nextChapters: GoalChapterContext[]
  }
  performance: {
    averageQuizScore: number | null
    studyStreak: number
    weakAreas: GoalWeakArea[]
  }
  recentActivity: {
    notesCompletedLast7Days: number
    quizzesTakenLast7Days: number
    aiTutorPromptsLast7Days: string[]
  }
  chapterById: Map<string, GoalChapterContext>
  quizById: Map<string, { quizId: string; chapterId: string; href: string }>
}

export class GoalContextRepository {
  async build(userId: string, classId: string): Promise<GoalGenerationContext> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      user,
      examTarget,
      chapters,
      noteProgressRows,
      quizAttempts,
      aiUserMessages,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true },
      }),
      prisma.studentExamTarget.findUnique({
        where: { userId },
      }),
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
          id: true,
          title: true,
          slug: true,
          subject: {
            select: { title: true, slug: true },
          },
          topics: {
            where: topicWithNotesWhere,
            select: {
              notes: { select: { id: true } },
            },
          },
          quizzes: {
            where: quizWithQuestionsWhere,
            orderBy: { orderIndex: "asc" },
            select: { id: true },
            take: 1,
          },
        },
      }),
      prisma.noteProgress.findMany({
        where: { userId },
        select: { noteId: true, status: true, lastViewedAt: true },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        select: {
          scorePercent: true,
          completedAt: true,
          quizId: true,
          quiz: {
            select: {
              id: true,
              chapterId: true,
              chapter: {
                select: {
                  title: true,
                  slug: true,
                  subject: { select: { title: true, slug: true } },
                },
              },
            },
          },
        },
        orderBy: { completedAt: "desc" },
      }),
      prisma.aiTutorChatMessage.findMany({
        where: {
          role: "USER",
          createdAt: { gte: sevenDaysAgo },
          session: { userId },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { content: true },
      }),
    ])

    const progressByNoteId = new Map(
      noteProgressRows.map((row) => [row.noteId, row.status])
    )
    const completedQuizIds = new Set(
      quizAttempts.map((attempt) => attempt.quizId)
    )

    const chapterContexts: GoalChapterContext[] = chapters.map((chapter) => {
      const progress = resolveChapterProgress(
        chapter,
        progressByNoteId,
        completedQuizIds
      )
      const noteIds = chapter.topics.flatMap((topic) =>
        topic.notes.map((note) => note.id)
      )
      const quizId = chapter.quizzes[0]?.id ?? null

      return {
        id: chapter.id,
        title: chapter.title,
        subjectTitle: chapter.subject.title,
        subjectSlug: chapter.subject.slug,
        chapterSlug: chapter.slug,
        progressPercent: progress.progressPercent,
        isCompleted: progress.isCompleted,
        hasQuiz: Boolean(quizId),
        quizId,
        href: chapterHref(chapter.subject.slug, chapter.slug),
        noteCount: noteIds.length,
        completedNotes: progress.completedNotes,
      }
    })

    const chapterById = new Map(chapterContexts.map((c) => [c.id, c]))
    const quizById = new Map(
      chapters.flatMap((chapter) =>
        chapter.quizzes.map((quiz) => [
          quiz.id,
          {
            quizId: quiz.id,
            chapterId: chapter.id,
            href: quizHref(chapter.subject.slug, chapter.slug, quiz.id),
          },
        ])
      )
    )

    const incompleteChapters = chapterContexts.filter((c) => !c.isCompleted)
    const nextChapters = incompleteChapters.slice(0, 6)
    const completedChapters = chapterContexts.filter(
      (c) => c.isCompleted
    ).length

    const activityDays = new Set<string>()
    let notesCompletedLast7Days = 0
    for (const row of noteProgressRows) {
      activityDays.add(dayKey(row.lastViewedAt))
      if (row.status === "COMPLETED" && row.lastViewedAt >= sevenDaysAgo) {
        notesCompletedLast7Days += 1
      }
    }

    let quizzesTakenLast7Days = 0
    const quizScores: number[] = []
    const weakAreaMap = new Map<
      string,
      { total: number; count: number; chapter: GoalWeakArea }
    >()

    for (const attempt of quizAttempts) {
      activityDays.add(dayKey(attempt.completedAt))
      quizScores.push(attempt.scorePercent)
      if (attempt.completedAt >= sevenDaysAgo) {
        quizzesTakenLast7Days += 1
      }

      const chapter = attempt.quiz.chapter
      const key = chapter.slug
      const href = chapterHref(chapter.subject.slug, chapter.slug)
      const entry = weakAreaMap.get(key) ?? {
        total: 0,
        count: 0,
        chapter: {
          chapterTitle: chapter.title,
          subjectTitle: chapter.subject.title,
          subjectSlug: chapter.subject.slug,
          chapterSlug: chapter.slug,
          averageScore: 0,
          href,
          quizId: attempt.quiz.id,
        },
      }
      entry.total += attempt.scorePercent
      entry.count += 1
      weakAreaMap.set(key, entry)
    }

    const weakAreas = [...weakAreaMap.values()]
      .map((entry) => ({
        ...entry.chapter,
        averageScore: Math.round(entry.total / entry.count),
      }))
      .filter((area) => area.averageScore < 75)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 4)

    const now = startOfDay(new Date())
    const daysUntilExam = examTarget
      ? Math.max(
          0,
          Math.ceil(
            (startOfDay(examTarget.examDate).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null

    return {
      studentName: user?.firstName?.trim() || "Student",
      classId,
      examTarget: examTarget
        ? { examName: examTarget.examName, examDate: examTarget.examDate }
        : null,
      daysUntilExam,
      syllabus: {
        completedChapters,
        totalChapters: chapterContexts.length,
        incompleteChapters,
        nextChapters,
      },
      performance: {
        averageQuizScore:
          quizScores.length > 0
            ? Math.round(
                quizScores.reduce((sum, score) => sum + score, 0) /
                  quizScores.length
              )
            : null,
        studyStreak: computeStudyStreak(activityDays),
        weakAreas,
      },
      recentActivity: {
        notesCompletedLast7Days,
        quizzesTakenLast7Days,
        aiTutorPromptsLast7Days: aiUserMessages
          .map((message) => message.content.trim())
          .filter(Boolean)
          .slice(0, 6),
      },
      chapterById,
      quizById,
    }
  }
}

export const goalContextRepository = new GoalContextRepository()
