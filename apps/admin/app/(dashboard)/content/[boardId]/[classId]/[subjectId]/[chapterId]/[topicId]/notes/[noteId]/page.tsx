import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentNotePageMetadata } from "@/features/dashboard/model/page-metadata"
import { contentHref } from "@/features/content/model/content-nav"
import { loadContentNote } from "@/features/content/server/load-content-note"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { NoteEditorView } from "@/features/content/view/note-editor-view"

type PageProps = {
  params: Promise<{
    boardId: string
    classId: string
    subjectId: string
    chapterId: string
    topicId: string
    noteId: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { boardId, classId, subjectId, chapterId, topicId, noteId } =
    await params
  const data = await loadContentNote(noteId)

  if (
    !data ||
    data.topicRef.boardId !== boardId ||
    data.topicRef.classId !== classId ||
    data.topicRef.subjectId !== subjectId ||
    data.topicRef.id !== chapterId ||
    data.topicRef.topicId !== topicId
  ) {
    return contentNotePageMetadata("Edit note")
  }

  return contentNotePageMetadata(data.note.title)
}

export default async function ContentNoteEditorPage({ params }: PageProps) {
  const { boardId, classId, subjectId, chapterId, topicId, noteId } =
    await params
  const data = await loadContentNote(noteId)

  if (
    !data ||
    data.topicRef.boardId !== boardId ||
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
          { label: "Content", href: contentHref.root() },
          { label: topicRef.boardName, href: contentHref.board(boardId) },
          {
            label: topicRef.classDisplayName,
            href: contentHref.class(boardId, classId),
          },
          {
            label: topicRef.subjectTitle,
            href: contentHref.subject(boardId, classId, subjectId),
          },
          {
            label: topicRef.title,
            href: contentHref.chapter(
              boardId,
              classId,
              subjectId,
              chapterId
            ),
          },
          {
            label: topicRef.topicTitle,
            href: contentHref.topic(
              boardId,
              classId,
              subjectId,
              chapterId,
              topicId
            ),
          },
          {
            label: note.title,
            href: contentHref.note(
              boardId,
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
