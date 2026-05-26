import { notFound } from "next/navigation"

import { resolveQuizPage } from "@/features/subjects/model/quiz-data"
import { getSubjectBySlug } from "@/features/subjects/model/subject-cards"
import { QuizView } from "@/features/subjects/view/quiz-view"

type QuizPageProps = {
  params: Promise<{
    subjectName: string
    chapterName: string
    quizId: string
  }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { subjectName, chapterName, quizId } = await params

  if (!getSubjectBySlug(subjectName)) notFound()

  const resolved = resolveQuizPage(subjectName, chapterName, quizId)
  if (!resolved) notFound()

  const { chapter, session } = resolved

  return (
    <QuizView subjectSlug={subjectName} chapter={chapter} session={session} />
  )
}
