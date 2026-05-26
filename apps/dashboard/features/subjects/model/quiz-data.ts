import type { ChapterItem, QuizItem } from "./chapter-data"
import {
  chapterSlug,
  getChapterBySlug,
  getQuizzesForChapter,
} from "./chapter-data"

export type McqOption = {
  id: string
  label: string
}

export type McqQuestion = {
  id: string
  question: string
  options: McqOption[]
  correctOptionId: string
}

export type QuizSession = {
  quiz: QuizItem
  chapterSlug: string
  questions: McqQuestion[]
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const

function makeOptions(labels: string[]): McqOption[] {
  return labels.map((label, i) => ({
    id: OPTION_LABELS[i]!.toLowerCase(),
    label,
  }))
}

const questionsByQuizKey: Record<string, McqQuestion[]> = {
  "linear-equations:q1": [
    {
      id: "1",
      question: "Which of these is a linear equation in one variable?",
      options: makeOptions(["x² + 2 = 5", "2x + 3 = 11", "xy = 4", "1/x = 2"]),
      correctOptionId: "b",
    },
    {
      id: "2",
      question: "What is the value of x if x + 7 = 15?",
      options: makeOptions(["6", "7", "8", "22"]),
      correctOptionId: "c",
    },
    {
      id: "3",
      question: "Solving 3x = 12 gives x equal to:",
      options: makeOptions(["3", "4", "9", "36"]),
      correctOptionId: "b",
    },
    {
      id: "4",
      question: "The solution to x − 5 = 0 is:",
      options: makeOptions(["0", "5", "−5", "10"]),
      correctOptionId: "b",
    },
    {
      id: "5",
      question: "Which step is correct when solving 2x + 4 = 10?",
      options: makeOptions([
        "Subtract 4 from both sides first",
        "Divide by 2 first",
        "Add 4 to both sides",
        "Multiply both sides by 2",
      ]),
      correctOptionId: "a",
    },
  ],
  "linear-equations:q2": [
    {
      id: "1",
      question: "What is the value of x in 2x + 3 = 11?",
      options: makeOptions(["3", "4", "5", "6"]),
      correctOptionId: "b",
    },
    {
      id: "2",
      question: "Solve for x: 5x − 10 = 15",
      options: makeOptions(["3", "4", "5", "25"]),
      correctOptionId: "c",
    },
    {
      id: "3",
      question: "If 4x + 8 = 32, then x equals:",
      options: makeOptions(["4", "6", "8", "10"]),
      correctOptionId: "b",
    },
    {
      id: "4",
      question: "What is the solution of x/3 = 7?",
      options: makeOptions(["10", "21", "3", "7"]),
      correctOptionId: "b",
    },
    {
      id: "5",
      question: "For 2(x + 1) = 10, the value of x is:",
      options: makeOptions(["3", "4", "5", "6"]),
      correctOptionId: "b",
    },
    {
      id: "6",
      question: "Which value of x makes 3x − 2 = 7 true?",
      options: makeOptions(["1", "2", "3", "4"]),
      correctOptionId: "c",
    },
    {
      id: "7",
      question: "Solve: 7x = 49",
      options: makeOptions(["6", "7", "8", "42"]),
      correctOptionId: "b",
    },
    {
      id: "8",
      question: "If x + 12 = 20, then x is:",
      options: makeOptions(["6", "7", "8", "32"]),
      correctOptionId: "c",
    },
    {
      id: "9",
      question: "The equation 6 − x = 1 has solution:",
      options: makeOptions(["5", "6", "7", "−5"]),
      correctOptionId: "a",
    },
    {
      id: "10",
      question: "What is x when 2x = 3x − 5?",
      options: makeOptions(["−5", "5", "0", "3"]),
      correctOptionId: "b",
    },
  ],
}

function defaultQuestions(chapter: ChapterItem, quiz: QuizItem): McqQuestion[] {
  const count = Math.min(quiz.questions, 5)
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    question: `Sample question ${i + 1} about ${chapter.title}`,
    options: makeOptions(["Option 1", "Option 2", "Option 3", "Option 4"]),
    correctOptionId: "a",
  }))
}

export function getQuestionsForQuiz(
  chapterSlugParam: string,
  quizId: string,
  chapter?: ChapterItem
): McqQuestion[] | undefined {
  const key = `${chapterSlugParam}:${quizId}`
  if (questionsByQuizKey[key]) return questionsByQuizKey[key]

  if (!chapter) return undefined
  const quiz = getQuizzesForChapter(chapter)?.find((q) => q.id === quizId)
  if (!quiz) return undefined
  return defaultQuestions(chapter, quiz)
}

export function resolveQuizPage(
  subjectSlug: string,
  chapterSlugParam: string,
  quizId: string
): { chapter: ChapterItem; session: QuizSession } | undefined {
  const chapter = getChapterBySlug(subjectSlug, chapterSlugParam)
  if (!chapter) return undefined

  const quiz = getQuizzesForChapter(chapter)?.find((q) => q.id === quizId)
  if (!quiz || quiz.status === "locked") return undefined

  const questions = getQuestionsForQuiz(chapterSlugParam, quizId, chapter)
  if (!questions?.length) return undefined

  return {
    chapter,
    session: { quiz, chapterSlug: chapterSlugParam, questions },
  }
}

export function quizHref(
  subjectSlug: string,
  chapterSlugParam: string,
  quizId: string
) {
  return `/subjects/${subjectSlug}/${chapterSlugParam}/quiz/${quizId}`
}

export function optionDisplayLabel(optionId: string): string {
  const index = ["a", "b", "c", "d"].indexOf(optionId)
  return index >= 0 ? OPTION_LABELS[index]! : optionId.toUpperCase()
}
