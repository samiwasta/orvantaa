import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  decodeContentClassSlug,
  formatContentClassPageTitle,
} from "@/features/content/model/content-class-slug"
import { loadContentSubjects } from "@/features/content/server/load-content-subjects"
import { ContentSubjectsView } from "@/features/content/view/content-subjects-view"

type ContentClassPageProps = {
  params: Promise<{ className: string }>
}

export async function generateMetadata({
  params,
}: ContentClassPageProps): Promise<Metadata> {
  const { className } = await params
  const display = formatContentClassPageTitle(decodeContentClassSlug(className))
  return {
    title: `${display} — Content - Orvantaa Admin`,
    description: `Manage subjects and chapters for ${display}`,
  }
}

export default async function ContentClassPage({ params }: ContentClassPageProps) {
  const { className } = await params
  const data = await loadContentSubjects(className)

  if (!data) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentSubjectsView data={data} />
    </div>
  )
}
