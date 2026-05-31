import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentSchoolClasses } from "@/features/content/server/load-content-classes"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentClassesView } from "@/features/content/view/content-classes-view"

type PageProps = {
  params: Promise<{ schoolId: string }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentSchoolPage({ params }: PageProps) {
  const { schoolId } = await params
  const data = await loadContentSchoolClasses(schoolId)

  if (!data) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Schools", href: contentHref.root() },
          { label: data.school.name, href: contentHref.school(schoolId) },
        ]}
      />
      <ContentClassesView school={data.school} classes={data.classes} />
    </div>
  )
}
