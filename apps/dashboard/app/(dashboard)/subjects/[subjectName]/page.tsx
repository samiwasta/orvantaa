import { notFound } from "next/navigation"

import { getChaptersForSubject } from "@/features/subjects/model/chapter-data"
import { getSubjectBySlug } from "@/features/subjects/model/subject-cards"
import { ChapterCardsView } from "@/features/subjects/view/chapter-cards-view"

type SubjectChaptersPageProps = {
  params: Promise<{ subjectName: string }>
}

export default async function SubjectChaptersPage({
  params,
}: SubjectChaptersPageProps) {
  const { subjectName } = await params
  const subject = getSubjectBySlug(subjectName)
  if (!subject) notFound()

  const chapters = getChaptersForSubject(subjectName)
  if (!chapters?.length) notFound()

  return <ChapterCardsView chapters={chapters} subjectSlug={subjectName} />
}
