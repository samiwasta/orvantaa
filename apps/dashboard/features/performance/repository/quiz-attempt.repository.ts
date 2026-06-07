import { prisma } from "@/lib/db"

type SubmitQuizAttemptInput = {
  userId: string
  quizId: string
  answers: Array<{
    questionId: string
    optionId: string
  }>
  timeSpentSeconds?: number
}

export class QuizAttemptRepository {
  async createAttempt(input: SubmitQuizAttemptInput) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: input.quizId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            options: { orderBy: { orderIndex: "asc" } },
          },
        },
      },
    })

    if (!quiz) {
      return null
    }

    const questionMap = new Map(
      quiz.questions.map((question) => [question.id, question])
    )

    if (input.answers.length !== quiz.questions.length) {
      throw new Error("All quiz questions must be answered.")
    }

    const gradedAnswers = input.answers.map((answer) => {
      const question = questionMap.get(answer.questionId)
      if (!question) {
        throw new Error("Invalid question in quiz attempt.")
      }

      const selectedOption = question.options.find(
        (option) => option.id === answer.optionId
      )
      if (!selectedOption) {
        throw new Error("Invalid option in quiz attempt.")
      }

      return {
        questionId: question.id,
        selectedOptionId: selectedOption.id,
        isCorrect: selectedOption.isCorrect,
      }
    })

    const correctCount = gradedAnswers.filter(
      (answer) => answer.isCorrect
    ).length
    const totalQuestions = quiz.questions.length
    const scorePercent = Math.round((correctCount / totalQuestions) * 100)

    return prisma.quizAttempt.create({
      data: {
        userId: input.userId,
        quizId: quiz.id,
        scorePercent,
        correctCount,
        totalQuestions,
        timeSpentSeconds: input.timeSpentSeconds,
        answers: {
          create: gradedAnswers,
        },
      },
    })
  }

  async verifyQuizAccess(userId: string, quizId: string, classId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, section: { classId } },
      select: { id: true },
    })
    if (!user) return null

    return prisma.quiz.findFirst({
      where: {
        id: quizId,
        questions: { some: {} },
        chapter: {
          OR: [
            { topics: { some: { notes: { some: {} } } } },
            { quizzes: { some: { questions: { some: {} } } } },
          ],
          subject: { classId },
        },
      },
      select: { id: true },
    })
  }
}

export const quizAttemptRepository = new QuizAttemptRepository()
