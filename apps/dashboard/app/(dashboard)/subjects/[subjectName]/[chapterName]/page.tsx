import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadChapterDetail } from "@/features/curriculum/server/load-chapter-detail"
import {
  chapterDetailPageMetadata,
  titleFromSlug,
} from "@/features/subjects/model/page-metadata"
import { ChapterDetailView } from "@/features/subjects/view/chapter-detail-view"

type ChapterDetailPageProps = {
  params: Promise<{ subjectName: string; chapterName: string }>
}

export async function generateMetadata({
  params,
}: ChapterDetailPageProps): Promise<Metadata> {
  const { subjectName, chapterName } = await params
  const detail = await loadChapterDetail(subjectName, chapterName)

  return chapterDetailPageMetadata(
    detail?.chapter.title ?? titleFromSlug(chapterName),
    titleFromSlug(subjectName)
  )
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
