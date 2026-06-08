import type { DashboardQuickLinks } from "@/features/dashboard/model/dashboard-quick-links"
import type {
  ChapterItem,
  ChapterStatus,
  QuizItem,
  TopicItem,
  TopicStatus,
} from "@/features/subjects/model/chapter-data"
import { getLearningObjectives } from "@/features/subjects/model/chapter-data"
import {
  noteHref,
  quizHref,
} from "@/features/subjects/model/content-navigation"
import type { NoteContent } from "@/features/subjects/model/note-data"
import {
  buildNoteNavigation,
  type NoteNavItem,
} from "@/features/subjects/model/note-navigation"
import { parseNoteBlocks } from "@/features/subjects/model/parse-note-blocks"
import type {
  McqQuestion,
  QuizSession,
} from "@/features/subjects/model/quiz-data"
import type { SubjectCardItem } from "@/features/subjects/model/subject-cards"

import {
  countCompletedChapters,
  resolveChapterProgress,
} from "../model/chapter-progress"
import { subjectImageUrl } from "../model/subject-images"
import {
  curriculumRepository,
  mapQuizDifficulty,
} from "../repository/curriculum.repository"

const OPTION_IDS = ["a", "b", "c", "d"] as const

function estimateTopicDuration(noteCount: number): string {
  const minutes = Math.max(5, noteCount * 5)
  return `${minutes} min`
}

function mapChapterItem(
  row: {
    number: number
    title: string
    slug: string
    topics: Array<{ notes: Array<{ id: string }> }>
    quizzes: Array<{ id: string }>
  },
  progress: ReturnType<typeof resolveChapterProgress>,
  index: number,
  total: number
): ChapterItem {
  let status: ChapterStatus = "not_started"
  if (progress.isCompleted) {
    status = "completed"
  } else if (progress.hasProgress || index === 0) {
    status = "in_progress"
  }

  return {
    number: row.number,
    title: row.title,
    slug: row.slug,
    status,
    progressPercent: progress.progressPercent,
    recommended: !progress.isCompleted && index === 0 && total > 1,
  }
}

function resolveTopicStatuses(
  topics: Array<{ slug: string; title: string; notes: { id: string }[] }>,
  noteProgress: Map<string, "VIEWED" | "COMPLETED">
): TopicItem[] {
  let previousCompleted = true

  return topics.map((row) => {
    const noteIds = row.notes.map((note) => note.id)
    const allCompleted =
      noteIds.length > 0 &&
      noteIds.every((noteId) => noteProgress.get(noteId) === "COMPLETED")

    let status: TopicStatus = "not_started"
    if (allCompleted) {
      status = "completed"
    } else if (previousCompleted) {
      status = "in_progress"
    }

    if (!allCompleted) {
      previousCompleted = false
    }

    return {
      id: row.slug,
      title: row.title,
      duration: estimateTopicDuration(row.notes.length),
      status,
      firstNoteId: row.notes[0]?.id ?? null,
    }
  })
}

export class CurriculumService {
  constructor(private readonly repository = curriculumRepository) {}

  async listSubjects(
    classId: string,
    userId?: string
  ): Promise<SubjectCardItem[]> {
    const rows = await this.repository.findSubjectsForClass(classId)

    const noteIds = rows.flatMap((subject) =>
      subject.chapters.flatMap((chapter) =>
        chapter.topics.flatMap((topic) => topic.notes.map((note) => note.id))
      )
    )
    const quizIds = rows.flatMap((subject) =>
      subject.chapters.flatMap((chapter) =>
        chapter.quizzes.map((quiz) => quiz.id)
      )
    )

    const noteProgressMap = new Map<string, "VIEWED" | "COMPLETED">()
    const completedQuizIds = new Set<string>()

    if (userId) {
      const [noteProgress, quizScores] = await Promise.all([
        this.repository.findStudentNoteProgress(userId, noteIds),
        this.repository.findStudentQuizScores(userId, quizIds),
      ])

      for (const progress of noteProgress) {
        noteProgressMap.set(progress.noteId, progress.status)
      }
      for (const score of quizScores) {
        completedQuizIds.add(score.quizId)
      }
    }

    return rows.map((row) => {
      const { completed, total } = countCompletedChapters(
        row.chapters,
        noteProgressMap,
        completedQuizIds
      )

      return {
        id: row.slug,
        title: row.title,
        completed,
        total,
        imageUrl: subjectImageUrl(row.slug, row.imageUrl),
      }
    })
  }

  async getDashboardQuickLinks(classId: string): Promise<DashboardQuickLinks> {
    const [firstNote, firstQuiz] = await Promise.all([
      this.repository.findFirstAssignedNote(classId),
      this.repository.findFirstAssignedQuiz(classId),
    ])

    return {
      subjectsHref: "/subjects",
      firstReadingHref: firstNote
        ? noteHref(
            firstNote.topic.chapter.subject.slug,
            firstNote.topic.chapter.slug,
            firstNote.topic.slug,
            firstNote.id
          )
        : "/subjects",
      firstQuizHref: firstQuiz
        ? quizHref(
            firstQuiz.chapter.subject.slug,
            firstQuiz.chapter.slug,
            firstQuiz.id
          )
        : "/subjects",
    }
  }

  async getSubject(
    classId: string,
    slug: string,
    userId?: string
  ): Promise<SubjectCardItem | null> {
    const row = await this.repository.findSubjectBySlug(classId, slug)
    if (!row) return null

    const noteIds = row.chapters.flatMap((chapter) =>
      chapter.topics.flatMap((topic) => topic.notes.map((note) => note.id))
    )
    const quizIds = row.chapters.flatMap((chapter) =>
      chapter.quizzes.map((quiz) => quiz.id)
    )

    const noteProgressMap = new Map<string, "VIEWED" | "COMPLETED">()
    const completedQuizIds = new Set<string>()

    if (userId) {
      const [noteProgress, quizScores] = await Promise.all([
        this.repository.findStudentNoteProgress(userId, noteIds),
        this.repository.findStudentQuizScores(userId, quizIds),
      ])

      for (const progress of noteProgress) {
        noteProgressMap.set(progress.noteId, progress.status)
      }
      for (const score of quizScores) {
        completedQuizIds.add(score.quizId)
      }
    }

    const { completed, total } = countCompletedChapters(
      row.chapters,
      noteProgressMap,
      completedQuizIds
    )

    return {
      id: row.slug,
      title: row.title,
      completed,
      total,
      imageUrl: subjectImageUrl(row.slug, row.imageUrl),
    }
  }

  async listChapters(
    classId: string,
    subjectSlug: string,
    userId?: string
  ): Promise<ChapterItem[] | null> {
    const subject = await this.repository.findSubjectBySlug(
      classId,
      subjectSlug
    )
    if (!subject) return null

    const rows = await this.repository.findChaptersForSubject(
      classId,
      subjectSlug
    )

    const noteIds = rows.flatMap((row) =>
      row.topics.flatMap((topic) => topic.notes.map((note) => note.id))
    )
    const quizIds = rows.flatMap((row) => row.quizzes.map((quiz) => quiz.id))

    const noteProgressMap = new Map<string, "VIEWED" | "COMPLETED">()
    const completedQuizIds = new Set<string>()

    if (userId) {
      const [noteProgress, quizScores] = await Promise.all([
        this.repository.findStudentNoteProgress(userId, noteIds),
        this.repository.findStudentQuizScores(userId, quizIds),
      ])

      for (const progress of noteProgress) {
        noteProgressMap.set(progress.noteId, progress.status)
      }
      for (const score of quizScores) {
        completedQuizIds.add(score.quizId)
      }
    }

    return rows.map((row, index) =>
      mapChapterItem(
        row,
        resolveChapterProgress(row, noteProgressMap, completedQuizIds),
        index,
        rows.length
      )
    )
  }

  async getChapterDetail(
    classId: string,
    subjectSlug: string,
    chapterSlug: string,
    userId?: string
  ): Promise<{
    chapter: ChapterItem
    topics: TopicItem[]
    quizzes: QuizItem[]
    objectives: string[]
  } | null> {
    const row = await this.repository.findChapterBySlug(
      classId,
      subjectSlug,
      chapterSlug
    )
    if (!row) return null

    const noteIds = row.topics.flatMap((topic) =>
      topic.notes.map((note) => note.id)
    )
    const quizIds = row.quizzes.map((quiz) => quiz.id)

    const noteProgressMap = new Map<string, "VIEWED" | "COMPLETED">()
    const quizScoreMap = new Map<string, number>()
    const completedQuizIds = new Set<string>()

    if (userId) {
      const [noteProgress, quizScores] = await Promise.all([
        this.repository.findStudentNoteProgress(userId, noteIds),
        this.repository.findStudentQuizScores(userId, quizIds),
      ])

      for (const progress of noteProgress) {
        noteProgressMap.set(progress.noteId, progress.status)
      }
      for (const score of quizScores) {
        quizScoreMap.set(score.quizId, score.scorePercent)
        completedQuizIds.add(score.quizId)
      }
    }

    const topics = resolveTopicStatuses(row.topics, noteProgressMap)
    const chapterProgress = resolveChapterProgress(
      row,
      noteProgressMap,
      completedQuizIds
    )

    const chapter: ChapterItem = {
      number: row.number,
      title: row.title,
      slug: row.slug,
      status: chapterProgress.isCompleted
        ? "completed"
        : chapterProgress.hasProgress
          ? "in_progress"
          : "in_progress",
      progressPercent: chapterProgress.progressPercent,
    }

    return {
      chapter,
      topics,
      quizzes: row.quizzes.map((quiz) => {
        const score = quizScoreMap.get(quiz.id)
        return {
          id: quiz.id,
          title: quiz.title,
          questions: quiz._count.questions,
          difficulty: mapQuizDifficulty(quiz.difficulty),
          status:
            score !== undefined
              ? ("completed" as const)
              : ("available" as const),
          score,
        }
      }),
      objectives: getLearningObjectives(chapter),
    }
  }

  async getNotePage(
    classId: string,
    subjectSlug: string,
    chapterSlug: string,
    topicSlug: string,
    noteId: string
  ): Promise<{
    chapter: ChapterItem
    topic: TopicItem
    note: NoteContent
    navigation: ReturnType<typeof buildNoteNavigation>
  } | null> {
    const row = await this.repository.findNoteById(
      classId,
      subjectSlug,
      chapterSlug,
      topicSlug,
      noteId
    )
    if (!row) return null

    const summaries: NoteNavItem[] = row.topic.notes.map((n) => ({
      id: n.id,
      title: n.title,
    }))
    const lessonIndex = summaries.findIndex((s) => s.id === noteId)
    const lessonNumber = lessonIndex >= 0 ? lessonIndex + 1 : 1

    const chapter: ChapterItem = {
      number: row.topic.chapter.number,
      title: row.topic.chapter.title,
      slug: row.topic.chapter.slug,
      status: "in_progress",
      progressPercent: 0,
    }

    const topic: TopicItem = {
      id: row.topic.slug,
      title: row.topic.title,
      duration: estimateTopicDuration(summaries.length),
      status: "in_progress",
      firstNoteId: summaries[0]?.id ?? null,
    }

    const note: NoteContent = {
      id: row.id,
      topicId: row.topic.slug,
      chapterSlug: row.topic.chapter.slug,
      title: row.title,
      lessonNumber,
      totalLessons: summaries.length || 1,
      blocks: parseNoteBlocks(row.blocks),
    }

    return {
      chapter,
      topic,
      note,
      navigation: buildNoteNavigation(summaries, noteId),
    }
  }

  async getQuizPage(
    classId: string,
    subjectSlug: string,
    chapterSlug: string,
    quizId: string
  ): Promise<{ chapter: ChapterItem; session: QuizSession } | null> {
    const row = await this.repository.findQuizById(
      classId,
      subjectSlug,
      chapterSlug,
      quizId
    )
    if (!row || row.questions.length === 0) return null

    const chapter: ChapterItem = {
      number: row.chapter.number,
      title: row.chapter.title,
      slug: row.chapter.slug,
      status: "in_progress",
      progressPercent: 0,
    }

    const questions: McqQuestion[] = row.questions.map((question, qi) => {
      const options = question.options.slice(0, 4).map((opt, oi) => ({
        id: OPTION_IDS[oi] ?? String(oi),
        dbId: opt.id,
        label: opt.label,
      }))
      const correctIndex = question.options.findIndex((o) => o.isCorrect)
      const correctOptionId =
        OPTION_IDS[correctIndex >= 0 ? correctIndex : 0] ?? "a"

      return {
        id: String(qi + 1),
        dbId: question.id,
        question: question.prompt,
        options,
        correctOptionId,
      }
    })

    const quiz: QuizItem = {
      id: row.id,
      title: row.title,
      questions: questions.length,
      difficulty: mapQuizDifficulty(row.difficulty),
      status: "available",
    }

    return {
      chapter,
      session: { quiz, chapterSlug: row.chapter.slug, questions },
    }
  }
}

export const curriculumService = new CurriculumService()
