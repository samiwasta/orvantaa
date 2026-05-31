"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { BookOpen, ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import { contentHref } from "../model/content-nav"
import type { ContentClassRef, ContentSubjectItem } from "../model/content-models"
import { deleteSubjectAction } from "../server/subject-actions"
import { SubjectFormDialog } from "./subject-form-dialog"

type ContentSubjectsViewProps = {
  classRef: ContentClassRef
  subjects: ContentSubjectItem[]
}

export function ContentSubjectsView({
  classRef,
  subjects,
}: ContentSubjectsViewProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ContentSubjectItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContentSubjectItem | null>(null)

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteSubjectAction,
    { successMessage: "Subject deleted", onSuccess: () => setDeleteTarget(null) }
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(subject: ContentSubjectItem) {
    setEditing(subject)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Subjects for{" "}
          <span className="font-medium text-foreground">
            {classRef.displayName}
          </span>{" "}
          at {classRef.schoolName}.
        </p>
        <Button
          type="button"
          onClick={openCreate}
          className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <BookOpen className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No subjects yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add the first subject for this class to start building chapters.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {subjects.map((subject) => (
            <li
              key={subject.id}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-sm ring-1 ring-black/[0.04] transition-all hover:border-[#6C5CE7]/35 hover:shadow-md"
            >
              <Link
                href={contentHref.subject(
                  classRef.schoolId,
                  classRef.id,
                  subject.id
                )}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#3b82f6]/10 text-[#3b82f6]">
                  <BookOpen className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {subject.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {subject.slug} · {subject.chapterCount} chapter
                    {subject.chapterCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label={`Actions for ${subject.title}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(subject)}>
                    <Pencil className="size-4" aria-hidden />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(subject)}
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

      <SubjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        classId={classRef.id}
        subject={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete subject"
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
