import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentQuiz } from "@/features/content/server/load-content-quiz"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { QuizEditorView } from "@/features/content/view/quiz-editor-view"

type PageProps = {
  params: Promise<{
    schoolId: string
    classId: string
    subjectId: string
    chapterId: string
    quizId: string
  }>
}

export const metadata: Metadata = {
  title: "Edit quiz - Orvantaa Admin",
}

export default async function ContentQuizEditorPage({ params }: PageProps) {
  const { schoolId, classId, subjectId, chapterId, quizId } = await params
  const data = await loadContentQuiz(quizId)

  if (
    !data ||
    data.chapterRef.schoolId !== schoolId ||
    data.chapterRef.classId !== classId ||
    data.chapterRef.subjectId !== subjectId ||
    data.chapterRef.id !== chapterId
  ) {
    notFound()
  }

  const { quiz, chapterRef } = data

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Schools", href: contentHref.root() },
          { label: chapterRef.schoolName, href: contentHref.school(schoolId) },
          {
            label: chapterRef.classDisplayName,
            href: contentHref.class(schoolId, classId),
          },
          {
            label: chapterRef.subjectTitle,
            href: contentHref.subject(schoolId, classId, subjectId),
          },
          {
            label: chapterRef.title,
            href: contentHref.chapter(
              schoolId,
              classId,
              subjectId,
              chapterId
            ),
          },
          {
            label: quiz.title,
            href: contentHref.quiz(
              schoolId,
              classId,
              subjectId,
              chapterId,
              quizId
            ),
          },
        ]}
      />
      <QuizEditorView chapterRef={chapterRef} initialQuiz={quiz} />
    </div>
  )
}
