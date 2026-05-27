import { notFound } from "next/navigation"

import { getChapterBySlug } from "@/features/subjects/model/chapter-data"
import { getSubjectBySlug } from "@/features/subjects/model/subject-cards"
import { ChapterDetailView } from "@/features/subjects/view/chapter-detail-view"

type ChapterDetailPageProps = {
  params: Promise<{ subjectName: string; chapterName: string }>
}

export default async function ChapterDetailPage({
  params,
}: ChapterDetailPageProps) {
  const { subjectName, chapterName } = await params
  const subject = getSubjectBySlug(subjectName)
  if (!subject) notFound()

  const chapter = getChapterBySlug(subjectName, chapterName)
  if (!chapter) notFound()

  return <ChapterDetailView subjectSlug={subjectName} chapter={chapter} />
}
