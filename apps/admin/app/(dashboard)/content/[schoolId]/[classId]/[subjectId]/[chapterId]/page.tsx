import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentTopics } from "@/features/content/server/load-content-topics"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentTopicsView } from "@/features/content/view/content-topics-view"

type PageProps = {
  params: Promise<{
    schoolId: string
    classId: string
    subjectId: string
    chapterId: string
  }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentChapterPage({ params }: PageProps) {
  const { schoolId, classId, subjectId, chapterId } = await params
  const data = await loadContentTopics(chapterId)

  if (
    !data ||
    data.chapterRef.schoolId !== schoolId ||
    data.chapterRef.classId !== classId ||
    data.chapterRef.subjectId !== subjectId
  ) {
    notFound()
  }

  const { chapterRef, topics } = data

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
        ]}
      />
      <ContentTopicsView chapterRef={chapterRef} topics={topics} />
    </div>
  )
}
