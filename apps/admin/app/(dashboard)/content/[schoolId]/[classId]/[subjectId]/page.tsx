import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentChapters } from "@/features/content/server/load-content-chapters"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentChaptersView } from "@/features/content/view/content-chapters-view"

type PageProps = {
  params: Promise<{ schoolId: string; classId: string; subjectId: string }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentSubjectPage({ params }: PageProps) {
  const { schoolId, classId, subjectId } = await params
  const data = await loadContentChapters(subjectId)

  if (
    !data ||
    data.subjectRef.schoolId !== schoolId ||
    data.subjectRef.classId !== classId
  ) {
    notFound()
  }

  const { subjectRef, chapters } = data

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Schools", href: contentHref.root() },
          { label: subjectRef.schoolName, href: contentHref.school(schoolId) },
          {
            label: subjectRef.classDisplayName,
            href: contentHref.class(schoolId, classId),
          },
          {
            label: subjectRef.title,
            href: contentHref.subject(schoolId, classId, subjectId),
          },
        ]}
      />
      <ContentChaptersView subjectRef={subjectRef} chapters={chapters} />
    </div>
  )
}
