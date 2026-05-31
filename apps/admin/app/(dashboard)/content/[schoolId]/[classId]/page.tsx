import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentSubjects } from "@/features/content/server/load-content-subjects"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentSubjectsView } from "@/features/content/view/content-subjects-view"

type PageProps = {
  params: Promise<{ schoolId: string; classId: string }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentClassPage({ params }: PageProps) {
  const { schoolId, classId } = await params
  const data = await loadContentSubjects(classId)

  if (!data || data.classRef.schoolId !== schoolId) {
    notFound()
  }

  const { classRef, subjects } = data

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Schools", href: contentHref.root() },
          { label: classRef.schoolName, href: contentHref.school(schoolId) },
          {
            label: classRef.displayName,
            href: contentHref.class(schoolId, classId),
          },
        ]}
      />
      <ContentSubjectsView classRef={classRef} subjects={subjects} />
    </div>
  )
}
