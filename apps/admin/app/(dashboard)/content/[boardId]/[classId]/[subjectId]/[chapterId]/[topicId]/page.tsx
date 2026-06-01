import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentTopicDetail } from "@/features/content/server/load-content-topic-detail"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentTopicDetailView } from "@/features/content/view/content-topic-detail-view"

type PageProps = {
  params: Promise<{
    boardId: string
    classId: string
    subjectId: string
    chapterId: string
    topicId: string
  }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentTopicPage({ params }: PageProps) {
  const { boardId, classId, subjectId, chapterId, topicId } = await params
  const data = await loadContentTopicDetail(topicId)

  if (
    !data ||
    data.topicRef.boardId !== boardId ||
    data.topicRef.classId !== classId ||
    data.topicRef.subjectId !== subjectId ||
    data.topicRef.id !== chapterId
  ) {
    notFound()
  }

  const { topicRef, notes } = data

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Content", href: contentHref.root() },
          { label: topicRef.boardName, href: contentHref.board(boardId) },
          {
            label: topicRef.classDisplayName,
            href: contentHref.class(boardId, classId),
          },
          {
            label: topicRef.subjectTitle,
            href: contentHref.subject(boardId, classId, subjectId),
          },
          {
            label: topicRef.title,
            href: contentHref.chapter(
              boardId,
              classId,
              subjectId,
              chapterId
            ),
          },
          {
            label: topicRef.topicTitle,
            href: contentHref.topic(
              boardId,
              classId,
              subjectId,
              chapterId,
              topicId
            ),
          },
        ]}
      />
      <ContentTopicDetailView topicRef={topicRef} notes={notes} />
    </div>
  )
}
