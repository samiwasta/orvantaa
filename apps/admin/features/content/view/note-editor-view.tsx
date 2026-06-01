"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import { contentHref } from "../model/content-nav"
import type { ContentTopicDetailRef } from "../model/content-models"
import type { NoteBlock } from "../model/note-blocks"
import { saveNoteAction } from "../server/note-actions"
import { NoteBlockEditor } from "./note-block-editor"

type NoteEditorViewProps = {
  topicRef: ContentTopicDetailRef
  noteId: string
  initialTitle: string
  initialBlocks: NoteBlock[]
}

export function NoteEditorView({
  topicRef,
  noteId,
  initialTitle,
  initialBlocks,
}: NoteEditorViewProps) {
  const [title, setTitle] = useState(initialTitle)
  const [blocks, setBlocks] = useState<NoteBlock[]>(initialBlocks)

  const topicHref = contentHref.topic(
    topicRef.boardId,
    topicRef.classId,
    topicRef.subjectId,
    topicRef.id,
    topicRef.topicId
  )

  const { run: runSave, pending } = useActionRunner(saveNoteAction, {
    successMessage: "Note saved",
  })

  function handleSave() {
    runSave(noteId, { title, blocks })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          className="w-fit rounded-xl text-muted-foreground hover:text-[#6C5CE7]"
          asChild
        >
          <Link href={topicHref}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to topic
          </Link>
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Save className="size-4" aria-hidden />
          {pending ? "Saving..." : "Save note"}
        </Button>
      </div>

      <Field>
        <FieldLabel htmlFor="note-title" required>
          Note title
        </FieldLabel>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-xl"
        />
      </Field>

      <NoteBlockEditor blocks={blocks} onChange={setBlocks} />
    </div>
  )
}
