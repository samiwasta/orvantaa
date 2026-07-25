import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadQuizPage } from "@/features/curriculum/server/load-quiz-page"
import { loadQuizProctorLock } from "@/features/proctoring/server/load-quiz-proctor-lock"
import {
  quizPageMetadata,
  titleFromSlug,
} from "@/features/subjects/model/page-metadata"
import { QuizView } from "@/features/subjects/view/quiz-view"

type QuizPageProps = {
  params: Promise<{
    subjectName: string
    chapterName: string
    quizId: string
  }>
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const { subjectName, chapterName, quizId } = await params

  const resolved = await loadQuizPage(subjectName, chapterName, quizId)

  return quizPageMetadata(
    resolved?.session.quiz.title ?? "Quiz",
    resolved?.chapter.title ?? titleFromSlug(chapterName)
  )
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { subjectName, chapterName, quizId } = await params

  const resolved = await loadQuizPage(subjectName, chapterName, quizId)
  if (!resolved) notFound()

  const { chapter, session } = resolved
  const proctorLock = await loadQuizProctorLock(session.quiz.id)

  return (
    <QuizView
      subjectSlug={subjectName}
      chapter={chapter}
      session={session}
      proctorLock={proctorLock}
    />
  )
}
