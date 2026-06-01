import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentTopics } from "@/features/content/server/load-content-topics"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentChapterQuizzesView } from "@/features/content/view/content-chapter-quizzes-view"
import { ContentTopicsView } from "@/features/content/view/content-topics-view"

type PageProps = {
  params: Promise<{
    boardId: string
    classId: string
    subjectId: string
    chapterId: string
  }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentChapterPage({ params }: PageProps) {
  const { boardId, classId, subjectId, chapterId } = await params
  const data = await loadContentTopics(chapterId)

  if (
    !data ||
    data.chapterRef.boardId !== boardId ||
    data.chapterRef.classId !== classId ||
    data.chapterRef.subjectId !== subjectId
  ) {
    notFound()
  }

  const { chapterRef, topics, quizzes } = data

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
        ]}
      />
      <ContentTopicsView chapterRef={chapterRef} topics={topics} />
      <ContentChapterQuizzesView chapterRef={chapterRef} quizzes={quizzes} />
    </div>
  )
}
