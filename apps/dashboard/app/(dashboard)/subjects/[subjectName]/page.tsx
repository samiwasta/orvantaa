import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadSubjectChapters } from "@/features/curriculum/server/load-subject-chapters"
import {
  subjectChaptersPageMetadata,
  titleFromSlug,
} from "@/features/subjects/model/page-metadata"
import { ChapterCardsView } from "@/features/subjects/view/chapter-cards-view"

type SubjectChaptersPageProps = {
  params: Promise<{ subjectName: string }>
}

export async function generateMetadata({
  params,
}: SubjectChaptersPageProps): Promise<Metadata> {
  const { subjectName } = await params
  const data = await loadSubjectChapters(subjectName)

  return subjectChaptersPageMetadata(
    data?.subject.title ?? titleFromSlug(subjectName)
  )
}

export default async function SubjectChaptersPage({
  params,
}: SubjectChaptersPageProps) {
  const { subjectName } = await params
  const data = await loadSubjectChapters(subjectName)
  if (!data) notFound()

  return <ChapterCardsView chapters={data.chapters} subjectSlug={subjectName} />
}
