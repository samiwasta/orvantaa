import { notFound } from "next/navigation"

import { resolveNotePage } from "@/features/subjects/model/note-data"
import { getSubjectBySlug } from "@/features/subjects/model/subject-cards"
import { NoteView } from "@/features/subjects/view/note-view"

type NotePageProps = {
  params: Promise<{
    subjectName: string
    chapterName: string
    topicName: string
    noteid: string
  }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { subjectName, chapterName, topicName, noteid } = await params

  if (!getSubjectBySlug(subjectName)) notFound()

  const resolved = resolveNotePage(subjectName, chapterName, topicName, noteid)
  if (!resolved) notFound()

  const { chapter, topic, note } = resolved

  return (
    <NoteView
      subjectSlug={subjectName}
      chapter={chapter}
      topic={topic}
      note={note}
    />
  )
}
