import { prisma } from "@/lib/db"

type SubmitQuizAttemptInput = {
  userId: string
  quizId: string
  answers: Array<{
    questionId: string
    optionId: string
  }>
  timeSpentSeconds?: number
  proctorWarnings?: number
  terminatedByProctor?: boolean
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

    const gradedAnswers: Array<{
      questionId: string
      selectedOptionId: string
      isCorrect: boolean
    }> = []
    const seenQuestionIds = new Set<string>()

    for (const answer of input.answers) {
      const question = questionMap.get(answer.questionId)
      if (!question) {
        throw new Error("Invalid question in quiz attempt.")
      }
      if (seenQuestionIds.has(question.id)) {
        throw new Error("Duplicate question in quiz attempt.")
      }
      seenQuestionIds.add(question.id)

      // Unanswered questions are kept out of the answer rows and graded as wrong.
      if (!answer.optionId) continue

      const selectedOption = question.options.find(
        (option) => option.id === answer.optionId
      )
      if (!selectedOption) {
        throw new Error("Invalid option in quiz attempt.")
      }

      gradedAnswers.push({
        questionId: question.id,
        selectedOptionId: selectedOption.id,
        isCorrect: selectedOption.isCorrect,
      })
    }

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
        answeredCount: gradedAnswers.length,
        proctorWarnings: input.proctorWarnings ?? 0,
        terminatedByProctor: input.terminatedByProctor ?? false,
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
