"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ChevronRight, FileText, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import { contentHref } from "../model/content-nav"
import type { ContentNoteItem, ContentTopicDetailRef } from "../model/content-models"
import { createNoteAction, deleteNoteAction } from "../server/note-actions"

type ContentTopicDetailViewProps = {
  topicRef: ContentTopicDetailRef
  notes: ContentNoteItem[]
}

export function ContentTopicDetailView({
  topicRef,
  notes,
}: ContentTopicDetailViewProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ContentNoteItem | null>(null)

  const { run: runCreate, pending: creating, fieldErrors, formError, reset } =
    useActionRunner(createNoteAction, {
      successMessage: "Note created",
      onSuccess: (data) => {
        setCreateOpen(false)
        setNewTitle("")
        router.push(
          contentHref.note(
            topicRef.boardId,
            topicRef.classId,
            topicRef.subjectId,
            topicRef.id,
            topicRef.topicId,
            data.id
          )
        )
      },
    })

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteNoteAction,
    { successMessage: "Note deleted", onSuccess: () => setDeleteTarget(null) }
  )

  function openCreate() {
    reset()
    setNewTitle("")
    setCreateOpen(true)
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    runCreate(topicRef.topicId, { title: newTitle })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Notes for{" "}
          <span className="font-medium text-foreground">
            {topicRef.topicTitle}
          </span>
          . Open a note to edit structured lesson content.
        </p>
        <Button
          type="button"
          onClick={openCreate}
          className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <FileText className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No notes yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a note with paragraphs, definitions, examples, lists, tips, quotes,
            and images.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note, index) => (
            <li
              key={note.id}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-sm ring-1 ring-black/[0.04] transition-all hover:border-[#6C5CE7]/35 hover:shadow-md"
            >
              <Link
                href={contentHref.note(
                  topicRef.boardId,
                  topicRef.classId,
                  topicRef.subjectId,
                  topicRef.id,
                  topicRef.topicId,
                  note.id
                )}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[11px] font-semibold text-[#6C5CE7]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {note.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {note.blockCount} block{note.blockCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label={`Actions for ${note.title}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={contentHref.note(
                        topicRef.boardId,
                        topicRef.classId,
                        topicRef.subjectId,
                        topicRef.id,
                        topicRef.topicId,
                        note.id
                      )}
                    >
                      <Pencil className="size-4" aria-hidden />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(note)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground/30"
                aria-hidden
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
            <DialogDescription>
              Name this lesson note. You can add content blocks on the next screen.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="new-note-title" required>
                Title
              </FieldLabel>
              <Input
                id="new-note-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. What is a Linear Equation?"
                autoFocus
              />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
            </Field>
            {formError ? (
              <p className="text-sm font-medium text-destructive">{formError}</p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create and edit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete note"
        description={
          deleteTarget
            ? `This permanently deletes "${deleteTarget.title}". This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        pending={deletePending}
        onConfirm={() => {
          if (deleteTarget) runDelete(deleteTarget.id)
        }}
      />
    </div>
  )
}
