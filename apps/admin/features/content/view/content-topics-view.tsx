"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ChevronRight, FileText, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { DraggableSortableList } from "@/features/shared/view/draggable-sortable-card"
import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import { contentHref } from "../model/content-nav"
import type { ContentChapterRef, ContentTopicItem } from "../model/content-models"
import { deleteTopicAction, reorderTopicsAction } from "../server/topic-actions"
import { TopicFormDialog } from "./topic-form-dialog"

type ContentTopicsViewProps = {
  chapterRef: ContentChapterRef
  topics: ContentTopicItem[]
}

export function ContentTopicsView({
  chapterRef,
  topics,
}: ContentTopicsViewProps) {
  const [orderedTopics, setOrderedTopics] = useState(topics)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ContentTopicItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContentTopicItem | null>(null)
  const reorderSnapshotRef = useRef(topics)

  useEffect(() => {
    setOrderedTopics(topics)
  }, [topics])

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteTopicAction,
    { successMessage: "Topic deleted", onSuccess: () => setDeleteTarget(null) }
  )

  const { run: runReorder, pending: reorderPending } = useActionRunner(
    (ids: string[]) => reorderTopicsAction(chapterRef.id, ids),
    {
      successMessage: "Topic order updated",
      onError: () => setOrderedTopics(reorderSnapshotRef.current),
    }
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(topic: ContentTopicItem) {
    setEditing(topic)
    setFormOpen(true)
  }

  function handleReorder(next: ContentTopicItem[]) {
    reorderSnapshotRef.current = orderedTopics
    setOrderedTopics(next)
    runReorder(next.map((topic) => topic.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Topics in{" "}
          <span className="font-medium text-foreground">{chapterRef.title}</span>.
        </p>
        <Button
          type="button"
          onClick={openCreate}
          className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add topic
        </Button>
      </div>

      {orderedTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <FileText className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No topics yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add the first topic to start writing notes.
          </p>
        </div>
      ) : (
        <DraggableSortableList
          items={orderedTopics}
          onReorder={handleReorder}
          disabled={reorderPending}
          getDragHandleLabel={(topic) => `Reorder ${topic.title}`}
          renderItem={(topic, index) => (
            <>
              <Link
                href={contentHref.topic(
                  chapterRef.boardId,
                  chapterRef.classId,
                  chapterRef.subjectId,
                  chapterRef.id,
                  topic.id
                )}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[11px] font-semibold text-[#6C5CE7]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {topic.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {topic.slug} · {topic.noteCount} note
                    {topic.noteCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label={`Actions for ${topic.title}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(topic)}>
                    <Pencil className="size-4" aria-hidden />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(topic)}
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

      <TopicFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        chapterId={chapterRef.id}
        topic={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete topic"
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
