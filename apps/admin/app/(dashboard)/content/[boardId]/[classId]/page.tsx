import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentClassPageMetadata } from "@/features/dashboard/model/page-metadata"
import { contentHref } from "@/features/content/model/content-nav"
import { loadContentSubjects } from "@/features/content/server/load-content-subjects"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentSubjectsView } from "@/features/content/view/content-subjects-view"

type PageProps = {
  params: Promise<{ boardId: string; classId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { boardId, classId } = await params
  const data = await loadContentSubjects(boardId, classId)

  return data
    ? contentClassPageMetadata(data.classRef.displayName)
    : contentClassPageMetadata("Content")
}

export default async function ContentClassPage({ params }: PageProps) {
  const { boardId, classId } = await params
  const data = await loadContentSubjects(boardId, classId)

  if (!data || data.classRef.boardId !== boardId) {
    notFound()
  }

  const { classRef, subjects } = data

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Content", href: contentHref.root() },
          { label: classRef.boardName, href: contentHref.board(boardId) },
          {
            label: classRef.displayName,
            href: contentHref.class(boardId, classId),
          },
        ]}
      />
      <ContentSubjectsView classRef={classRef} subjects={subjects} />
    </div>
  )
}
