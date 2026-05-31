import type { Prisma, QuizDifficulty } from "@prisma/client"

import { prisma } from "@/lib/db"

export class CurriculumRepository {
  async findSubjectsForClass(classId: string) {
    return prisma.subject.findMany({
      where: { classId },
      orderBy: { orderIndex: "asc" },
      include: { _count: { select: { chapters: true } } },
    })
  }

  async findSubjectBySlug(classId: string, slug: string) {
    return prisma.subject.findFirst({
      where: { classId, slug },
      include: { _count: { select: { chapters: true } } },
    })
  }

  async findChaptersForSubject(classId: string, subjectSlug: string) {
    return prisma.chapter.findMany({
      where: { subject: { classId, slug: subjectSlug } },
      orderBy: { number: "asc" },
    })
  }

  async findChapterBySlug(
    classId: string,
    subjectSlug: string,
    chapterSlug: string
  ) {
    return prisma.chapter.findFirst({
      where: {
        slug: chapterSlug,
        subject: { classId, slug: subjectSlug },
      },
      include: {
        topics: {
          orderBy: { orderIndex: "asc" },
          include: {
            notes: {
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, orderIndex: true },
            },
          },
        },
        quizzes: {
          orderBy: { orderIndex: "asc" },
          include: { _count: { select: { questions: true } } },
        },
      },
    })
  }

  async findNoteById(
    classId: string,
    subjectSlug: string,
    chapterSlug: string,
    topicSlug: string,
    noteId: string
  ) {
    return prisma.note.findFirst({
      where: {
        id: noteId,
        topic: {
          slug: topicSlug,
          chapter: {
            slug: chapterSlug,
            subject: { classId, slug: subjectSlug },
          },
        },
      },
      include: {
        topic: {
          include: {
            notes: {
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, orderIndex: true },
            },
            chapter: {
              select: { id: true, title: true, slug: true, number: true },
            },
          },
        },
      },
    })
  }

  async findQuizById(
    classId: string,
    subjectSlug: string,
    chapterSlug: string,
    quizId: string
  ) {
    return prisma.quiz.findFirst({
      where: {
        id: quizId,
        chapter: {
          slug: chapterSlug,
          subject: { classId, slug: subjectSlug },
        },
      },
      include: {
        chapter: {
          select: { id: true, title: true, slug: true, number: true },
        },
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            options: { orderBy: { orderIndex: "asc" } },
          },
        },
      },
    })
  }
}

export const curriculumRepository = new CurriculumRepository()

export type CurriculumQuizRow = Prisma.QuizGetPayload<{
  include: {
    chapter: { select: { id: true; title: true; slug: true; number: true } }
    questions: {
      include: { options: true }
    }
  }
}>

export function mapQuizDifficulty(
  difficulty: QuizDifficulty
): "easy" | "medium" | "hard" {
  switch (difficulty) {
    case "EASY":
      return "easy"
    case "HARD":
      return "hard"
    default:
      return "medium"
  }
}
