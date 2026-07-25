import { prisma } from "@/lib/db"
import type { Prisma, QuizDifficulty } from "@/lib/generated/prisma"

import {
  chapterWithAssignedContentWhere,
  quizWithQuestionsWhere,
  subjectWithAssignedContentWhere,
  topicWithNotesWhere,
} from "../model/assigned-content-filters"

export class CurriculumRepository {
  async findSubjectsForClass(classId: string) {
    return prisma.subject.findMany({
      where: {
        classId,
        ...subjectWithAssignedContentWhere,
      },
      orderBy: { orderIndex: "asc" },
      include: {
        chapters: {
          where: chapterWithAssignedContentWhere,
          orderBy: { number: "asc" },
          include: {
            topics: {
              where: topicWithNotesWhere,
              orderBy: { orderIndex: "asc" },
              include: {
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
        },
      },
    })
  }

  async findSubjectBySlug(classId: string, slug: string) {
    return prisma.subject.findFirst({
      where: {
        classId,
        slug,
        ...subjectWithAssignedContentWhere,
      },
      include: {
        chapters: {
          where: chapterWithAssignedContentWhere,
          orderBy: { number: "asc" },
          include: {
            topics: {
              where: topicWithNotesWhere,
              orderBy: { orderIndex: "asc" },
              include: {
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
        },
      },
    })
  }

  async findChaptersForSubject(classId: string, subjectSlug: string) {
    return prisma.chapter.findMany({
      where: {
        subject: { classId, slug: subjectSlug },
        ...chapterWithAssignedContentWhere,
      },
      orderBy: { number: "asc" },
      include: {
        topics: {
          where: topicWithNotesWhere,
          orderBy: { orderIndex: "asc" },
          include: {
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
        ...chapterWithAssignedContentWhere,
      },
      include: {
        topics: {
          where: topicWithNotesWhere,
          orderBy: { orderIndex: "asc" },
          include: {
            notes: {
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, orderIndex: true },
            },
          },
        },
        quizzes: {
          where: quizWithQuestionsWhere,
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
          ...topicWithNotesWhere,
          chapter: {
            slug: chapterSlug,
            ...chapterWithAssignedContentWhere,
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
        ...quizWithQuestionsWhere,
        chapter: {
          slug: chapterSlug,
          ...chapterWithAssignedContentWhere,
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

  async findStudentNoteProgress(userId: string, noteIds: string[]) {
    if (noteIds.length === 0) return []

    return prisma.noteProgress.findMany({
      where: { userId, noteId: { in: noteIds } },
      select: { noteId: true, status: true },
    })
  }

  async findStudentQuizScores(userId: string, quizIds: string[]) {
    if (quizIds.length === 0) return []

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, quizId: { in: quizIds } },
      select: { quizId: true, scorePercent: true },
      orderBy: [{ quizId: "asc" }, { scorePercent: "desc" }],
    })

    const bestByQuiz = new Map<string, number>()
    for (const attempt of attempts) {
      if (!bestByQuiz.has(attempt.quizId)) {
        bestByQuiz.set(attempt.quizId, attempt.scorePercent)
      }
    }

    return [...bestByQuiz.entries()].map(([quizId, scorePercent]) => ({
      quizId,
      scorePercent,
    }))
  }

  async findFirstAssignedNote(classId: string) {
    return prisma.note.findFirst({
      where: {
        topic: {
          ...topicWithNotesWhere,
          chapter: {
            ...chapterWithAssignedContentWhere,
            subject: {
              classId,
              ...subjectWithAssignedContentWhere,
            },
          },
        },
      },
      orderBy: [
        { topic: { chapter: { subject: { orderIndex: "asc" } } } },
        { topic: { chapter: { number: "asc" } } },
        { topic: { orderIndex: "asc" } },
        { orderIndex: "asc" },
      ],
      select: {
        id: true,
        topic: {
          select: {
            slug: true,
            chapter: {
              select: {
                slug: true,
                subject: { select: { slug: true } },
              },
            },
          },
        },
      },
    })
  }

  async findFirstAssignedQuiz(classId: string) {
    return prisma.quiz.findFirst({
      where: {
        ...quizWithQuestionsWhere,
        chapter: {
          ...chapterWithAssignedContentWhere,
          subject: {
            classId,
            ...subjectWithAssignedContentWhere,
          },
        },
      },
      orderBy: [
        { chapter: { subject: { orderIndex: "asc" } } },
        { chapter: { number: "asc" } },
        { orderIndex: "asc" },
      ],
      select: {
        id: true,
        chapter: {
          select: {
            slug: true,
            subject: { select: { slug: true } },
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

export function mapQuizTimedMode(
  timedMode: "UNTIMED" | "PER_QUESTION" | "WHOLE_QUIZ"
): "untimed" | "per_question" | "whole_quiz" {
  switch (timedMode) {
    case "PER_QUESTION":
      return "per_question"
    case "WHOLE_QUIZ":
      return "whole_quiz"
    default:
      return "untimed"
  }
}
