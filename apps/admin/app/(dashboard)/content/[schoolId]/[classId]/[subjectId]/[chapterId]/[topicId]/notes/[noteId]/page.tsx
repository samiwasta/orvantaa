import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentNote } from "@/features/content/server/load-content-note"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { NoteEditorView } from "@/features/content/view/note-editor-view"

type PageProps = {
  params: Promise<{
    schoolId: string
    classId: string
    subjectId: string
    chapterId: string
    topicId: string
    noteId: string
  }>
}

export const metadata: Metadata = {
  title: "Edit note - Orvantaa Admin",
}

export default async function ContentNoteEditorPage({ params }: PageProps) {
  const { schoolId, classId, subjectId, chapterId, topicId, noteId } =
    await params
  const data = await loadContentNote(noteId)

  if (
    !data ||
    data.topicRef.schoolId !== schoolId ||
    data.topicRef.classId !== classId ||
    data.topicRef.subjectId !== subjectId ||
    data.topicRef.id !== chapterId ||
    data.topicRef.topicId !== topicId
  ) {
    notFound()
  }

  const { note, topicRef } = data

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Schools", href: contentHref.root() },
          { label: topicRef.schoolName, href: contentHref.school(schoolId) },
          {
            label: topicRef.classDisplayName,
            href: contentHref.class(schoolId, classId),
          },
          {
            label: topicRef.subjectTitle,
            href: contentHref.subject(schoolId, classId, subjectId),
          },
          {
            label: topicRef.title,
            href: contentHref.chapter(
              schoolId,
              classId,
              subjectId,
              chapterId
            ),
          },
          {
            label: topicRef.topicTitle,
            href: contentHref.topic(
              schoolId,
              classId,
              subjectId,
              chapterId,
              topicId
            ),
          },
          {
            label: note.title,
            href: contentHref.note(
              schoolId,
              classId,
              subjectId,
              chapterId,
              topicId,
              noteId
            ),
          },
        ]}
      />
      <NoteEditorView
        topicRef={topicRef}
        noteId={note.id}
        initialTitle={note.title}
        initialBlocks={note.blocks}
      />
    </div>
  )
}
