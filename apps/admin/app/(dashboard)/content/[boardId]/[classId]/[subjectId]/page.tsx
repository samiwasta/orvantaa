import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentChapters } from "@/features/content/server/load-content-chapters"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentChaptersView } from "@/features/content/view/content-chapters-view"

type PageProps = {
  params: Promise<{ boardId: string; classId: string; subjectId: string }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentSubjectPage({ params }: PageProps) {
  const { boardId, classId, subjectId } = await params
  const data = await loadContentChapters(subjectId)

  if (
    !data ||
    data.subjectRef.boardId !== boardId ||
    data.subjectRef.classId !== classId
  ) {
    notFound()
  }

  const { subjectRef, chapters } = data

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Content", href: contentHref.root() },
          { label: subjectRef.boardName, href: contentHref.board(boardId) },
          {
            label: subjectRef.classDisplayName,
            href: contentHref.class(boardId, classId),
          },
          {
            label: subjectRef.title,
            href: contentHref.subject(boardId, classId, subjectId),
          },
        ]}
      />
      <ContentChaptersView subjectRef={subjectRef} chapters={chapters} />
    </div>
  )
}
