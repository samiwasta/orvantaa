import { notFound } from "next/navigation"

import { loadSubjectChapters } from "@/features/curriculum/server/load-subject-chapters"
import { ChapterCardsView } from "@/features/subjects/view/chapter-cards-view"

type SubjectChaptersPageProps = {
  params: Promise<{ subjectName: string }>
}

export default async function SubjectChaptersPage({
  params,
}: SubjectChaptersPageProps) {
  const { subjectName } = await params
  const data = await loadSubjectChapters(subjectName)
  if (!data) notFound()

  return <ChapterCardsView chapters={data.chapters} subjectSlug={subjectName} />
}
