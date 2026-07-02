import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentQuizPageMetadata } from "@/features/dashboard/model/page-metadata"
import { contentHref } from "@/features/content/model/content-nav"
import { loadContentQuiz } from "@/features/content/server/load-content-quiz"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { QuizEditorView } from "@/features/content/view/quiz-editor-view"

type PageProps = {
  params: Promise<{
    boardId: string
    classId: string
    subjectId: string
    chapterId: string
    quizId: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { boardId, classId, subjectId, chapterId, quizId } = await params
  const data = await loadContentQuiz(quizId)

  if (
    !data ||
    data.chapterRef.boardId !== boardId ||
    data.chapterRef.classId !== classId ||
    data.chapterRef.subjectId !== subjectId ||
    data.chapterRef.id !== chapterId
  ) {
    return contentQuizPageMetadata("Edit quiz")
  }

  return contentQuizPageMetadata(data.quiz.title)
}

export default async function ContentQuizEditorPage({ params }: PageProps) {
  const { boardId, classId, subjectId, chapterId, quizId } = await params
  const data = await loadContentQuiz(quizId)

  if (
    !data ||
    data.chapterRef.boardId !== boardId ||
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
          { label: "Content", href: contentHref.root() },
          { label: chapterRef.boardName, href: contentHref.board(boardId) },
          {
            label: chapterRef.classDisplayName,
            href: contentHref.class(boardId, classId),
          },
          {
            label: chapterRef.subjectTitle,
            href: contentHref.subject(boardId, classId, subjectId),
          },
          {
            label: chapterRef.title,
            href: contentHref.chapter(
              boardId,
              classId,
              subjectId,
              chapterId
            ),
          },
          {
            label: quiz.title,
            href: contentHref.quiz(
              boardId,
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
