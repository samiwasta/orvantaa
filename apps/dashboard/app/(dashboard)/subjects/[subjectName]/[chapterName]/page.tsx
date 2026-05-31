import { notFound } from "next/navigation"

import { loadChapterDetail } from "@/features/curriculum/server/load-chapter-detail"
import { ChapterDetailView } from "@/features/subjects/view/chapter-detail-view"

type ChapterDetailPageProps = {
  params: Promise<{ subjectName: string; chapterName: string }>
}

export default async function ChapterDetailPage({
  params,
}: ChapterDetailPageProps) {
  const { subjectName, chapterName } = await params
  const detail = await loadChapterDetail(subjectName, chapterName)
  if (!detail) notFound()

  return (
    <ChapterDetailView
      subjectSlug={subjectName}
      chapter={detail.chapter}
      topics={detail.topics}
      quizzes={detail.quizzes}
      objectives={detail.objectives}
    />
  )
}
