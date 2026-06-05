"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ChevronRight, Layers, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { DraggableSortableList } from "@/features/shared/view/draggable-sortable-card"
import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import { contentHref } from "../model/content-nav"
import type { ContentChapterItem, ContentSubjectRef } from "../model/content-models"
import {
  deleteChapterAction,
  reorderChaptersAction,
} from "../server/chapter-actions"
import { ChapterFormDialog } from "./chapter-form-dialog"

type ContentChaptersViewProps = {
  subjectRef: ContentSubjectRef
  chapters: ContentChapterItem[]
}

export function ContentChaptersView({
  subjectRef,
  chapters,
}: ContentChaptersViewProps) {
  const [orderedChapters, setOrderedChapters] = useState(chapters)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ContentChapterItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContentChapterItem | null>(null)
  const reorderSnapshotRef = useRef(chapters)

  useEffect(() => {
    setOrderedChapters(chapters)
  }, [chapters])

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteChapterAction,
    { successMessage: "Chapter deleted", onSuccess: () => setDeleteTarget(null) }
  )

  const { run: runReorder, pending: reorderPending } = useActionRunner(
    (ids: string[]) => reorderChaptersAction(subjectRef.id, ids),
    {
      successMessage: "Chapter order updated",
      onError: () => setOrderedChapters(reorderSnapshotRef.current),
    }
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(chapter: ContentChapterItem) {
    setEditing(chapter)
    setFormOpen(true)
  }

  function handleReorder(next: ContentChapterItem[]) {
    reorderSnapshotRef.current = orderedChapters
    setOrderedChapters(next)
    runReorder(next.map((chapter) => chapter.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Chapters in{" "}
          <span className="font-medium text-foreground">{subjectRef.title}</span>.
        </p>
        <Button
          type="button"
          onClick={openCreate}
          className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add chapter
        </Button>
      </div>

      {orderedChapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <Layers className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No chapters yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add the first chapter to start adding topics.
          </p>
        </div>
      ) : (
        <DraggableSortableList
          items={orderedChapters}
          onReorder={handleReorder}
          disabled={reorderPending}
          getDragHandleLabel={(chapter) => `Reorder ${chapter.title}`}
          renderItem={(chapter, index) => (
            <>
              <Link
                href={contentHref.chapter(
                  subjectRef.boardId,
                  subjectRef.classId,
                  subjectRef.id,
                  chapter.id
                )}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[11px] font-semibold text-[#b4720a]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {chapter.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {chapter.slug} · {chapter.topicCount} topic
                    {chapter.topicCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label={`Actions for ${chapter.title}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(chapter)}>
                    <Pencil className="size-4" aria-hidden />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(chapter)}
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
            </>
          )}
        />
      )}

      <ChapterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subjectId={subjectRef.id}
        chapter={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete chapter"
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
