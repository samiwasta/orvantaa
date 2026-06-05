"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { ArrowLeft, FileText, Save } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import { contentHref } from "../model/content-nav"
import type { ContentTopicDetailRef } from "../model/content-models"
import type { NoteBlock } from "../model/note-blocks"
import { saveNoteAction } from "../server/note-actions"
import { NoteBlockEditor } from "./note-block-editor"
import { NoteBlockPreview } from "./note-block-preview"

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

  const { run: runSave, pending, fieldErrors, formError } = useActionRunner(
    saveNoteAction,
    { successMessage: "Note saved" }
  )

  function handleSave() {
    runSave(noteId, { title, blocks })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-xl text-muted-foreground hover:text-[#6C5CE7]"
              asChild
            >
              <Link href={topicHref} aria-label="Back to topic">
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7]">
                  <FileText className="size-4" aria-hidden />
                </span>
                <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Edit note
                </h1>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {topicRef.topicTitle} · {topicRef.title}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="h-10 shrink-0 rounded-xl bg-[#6C5CE7] px-5 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Save className="size-4" aria-hidden />
            {pending ? "Saving..." : "Save note"}
          </Button>
        </div>

        <div className="border-b border-border/60 bg-muted/10 px-5 py-4 sm:px-6">
          <Field>
            <FieldLabel htmlFor="note-title" required>
              Note title
            </FieldLabel>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. What is a linear equation?"
              className="h-11 max-w-2xl rounded-xl border-border/60 bg-white text-base"
            />
            <FieldError>{fieldErrors.title?.[0]}</FieldError>
          </Field>
          {formError ? (
            <p className="mt-2 text-sm font-medium text-destructive">{formError}</p>
          ) : null}
        </div>

        <div className="grid min-h-[min(720px,calc(100vh-14rem))] grid-cols-1 items-stretch lg:grid-cols-2">
          <div className="flex min-h-0 flex-col border-b border-border/60 p-5 lg:border-r lg:border-b-0 sm:p-6">
            <NoteBlockEditor blocks={blocks} onChange={setBlocks} />
          </div>

          <div className="flex h-full min-h-[min(720px,calc(100vh-14rem))] flex-col bg-muted/10 p-5 sm:p-6 lg:sticky lg:top-4">
            <NoteBlockPreview
              title={title}
              blocks={blocks}
              topicTitle={topicRef.topicTitle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
