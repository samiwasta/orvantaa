import type {
  ChapterItem,
  QuizItem,
  TopicItem,
} from "@/features/subjects/model/chapter-data"
import { getLearningObjectives } from "@/features/subjects/model/chapter-data"
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
  row: { number: number; title: string; slug: string },
  index: number,
  total: number
): ChapterItem {
  const status =
    index === 0 ? ("in_progress" as const) : ("not_started" as const)
  return {
    number: row.number,
    title: row.title,
    slug: row.slug,
    status,
    progressPercent: 0,
    recommended: index === 0 && total > 1,
  }
}

function mapTopicItem(row: {
  slug: string
  title: string
  notes: { id: string }[]
}): TopicItem {
  return {
    id: row.slug,
    title: row.title,
    duration: estimateTopicDuration(row.notes.length),
    status: "in_progress",
    firstNoteId: row.notes[0]?.id ?? null,
  }
}

export class CurriculumService {
  constructor(private readonly repository = curriculumRepository) {}

  async listSubjects(classId: string): Promise<SubjectCardItem[]> {
    const rows = await this.repository.findSubjectsForClass(classId)
    return rows.map((row) => ({
      id: row.slug,
      title: row.title,
      completed: 0,
      total: row._count.chapters,
      imageUrl: subjectImageUrl(row.slug, row.imageUrl),
    }))
  }

  async getSubject(
    classId: string,
    slug: string
  ): Promise<SubjectCardItem | null> {
    const row = await this.repository.findSubjectBySlug(classId, slug)
    if (!row) return null
    return {
      id: row.slug,
      title: row.title,
      completed: 0,
      total: row._count.chapters,
      imageUrl: subjectImageUrl(row.slug, row.imageUrl),
    }
  }

  async listChapters(
    classId: string,
    subjectSlug: string
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
    return rows.map((row, index) => mapChapterItem(row, index, rows.length))
  }

  async getChapterDetail(
    classId: string,
    subjectSlug: string,
    chapterSlug: string
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

    const chapter: ChapterItem = {
      number: row.number,
      title: row.title,
      slug: row.slug,
      status: "in_progress",
      progressPercent: 0,
    }

    return {
      chapter,
      topics: row.topics.map(mapTopicItem),
      quizzes: row.quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        questions: quiz._count.questions,
        difficulty: mapQuizDifficulty(quiz.difficulty),
        status: "available" as const,
      })),
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
        label: opt.label,
      }))
      const correctIndex = question.options.findIndex((o) => o.isCorrect)
      const correctOptionId =
        OPTION_IDS[correctIndex >= 0 ? correctIndex : 0] ?? "a"

      return {
        id: String(qi + 1),
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
