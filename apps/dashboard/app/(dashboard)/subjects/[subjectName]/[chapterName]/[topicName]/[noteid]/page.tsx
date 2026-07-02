import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadNotePage } from "@/features/curriculum/server/load-note-page"
import {
  notePageMetadata,
  titleFromSlug,
} from "@/features/subjects/model/page-metadata"
import { NoteView } from "@/features/subjects/view/note-view"

type NotePageProps = {
  params: Promise<{
    subjectName: string
    chapterName: string
    topicName: string
    noteid: string
  }>
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { subjectName, chapterName, topicName, noteid } = await params

  const resolved = await loadNotePage(
    subjectName,
    chapterName,
    topicName,
    noteid
  )

  return notePageMetadata(
    resolved?.note.title ?? titleFromSlug(noteid),
    resolved?.topic.title ?? titleFromSlug(topicName)
  )
}

export default async function NotePage({ params }: NotePageProps) {
  const { subjectName, chapterName, topicName, noteid } = await params

  const resolved = await loadNotePage(
    subjectName,
    chapterName,
    topicName,
    noteid
  )
  if (!resolved) notFound()

  const { chapter, topic, note, navigation } = resolved

  return (
    <NoteView
      subjectSlug={subjectName}
      chapter={chapter}
      topic={topic}
      note={note}
      navigation={navigation}
    />
  )
}
