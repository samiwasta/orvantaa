import { notFound } from "next/navigation"

import { loadQuizPage } from "@/features/curriculum/server/load-quiz-page"
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

  const resolved = await loadQuizPage(subjectName, chapterName, quizId)
  if (!resolved) notFound()

  const { chapter, session } = resolved

  return (
    <QuizView subjectSlug={subjectName} chapter={chapter} session={session} />
  )
}
