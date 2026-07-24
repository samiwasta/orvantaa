import type { Prisma } from "@/lib/generated/prisma"

export const chapterWithAssignedContentWhere: Prisma.ChapterWhereInput = {
  OR: [
    { topics: { some: { notes: { some: {} } } } },
    { quizzes: { some: { questions: { some: {} } } } },
  ],
}

export const topicWithNotesWhere: Prisma.TopicWhereInput = {
  notes: { some: {} },
}

export const quizWithQuestionsWhere: Prisma.QuizWhereInput = {
  questions: { some: {} },
}

export const subjectWithAssignedContentWhere: Prisma.SubjectWhereInput = {
  chapters: {
    some: chapterWithAssignedContentWhere,
  },
}
