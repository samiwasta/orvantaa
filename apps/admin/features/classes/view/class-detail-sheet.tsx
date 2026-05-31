"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { GraduationCap, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import type { ClassListItem, SchoolOption } from "../model/class-list-item"
import type { ClassGradeSummary } from "../model/classes-filters"
import { deleteClassAction } from "../server/actions"
import { ClassFormDialog } from "./class-form-dialog"
import { SectionsManager } from "./sections-manager"

type ClassDetailSheetProps = {
  summary: ClassGradeSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolOptions: SchoolOption[]
}

export function ClassDetailSheet({
  summary,
  open,
  onOpenChange,
  schoolOptions,
}: ClassDetailSheetProps) {
  const [editing, setEditing] = useState<ClassListItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ClassListItem | null>(null)

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteClassAction,
    {
      successMessage: "Class deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  const title = summary ? summary.classDisplayName : "Class details"
  const instances = summary?.instances ?? []

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex h-full max-h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b border-border/50 px-6 py-5 text-left">
            <div className="flex items-center gap-3 pr-8">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
                <GraduationCap className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <SheetTitle className="font-heading text-lg">{title}</SheetTitle>
                {summary ? (
                  <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">
                        {summary.schoolCount}
                      </span>{" "}
                      {summary.schoolCount === 1 ? "school" : "schools"}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">
                        {summary.studentCount}
                      </span>{" "}
                      students
                    </span>
                    <span>
                      <span className="font-medium text-foreground">
                        {summary.subjectCount}
                      </span>{" "}
                      subjects
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </SheetHeader>

          {summary ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4">
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    className="rounded-2xl border border-border/60 bg-muted/15 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {instance.schoolName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {instance.boardName} · {instance.schoolCode} ·{" "}
                          {instance.subjectCount} subjects
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-[#6C5CE7]"
                          aria-label={`Edit ${instance.schoolName} ${title}`}
                          onClick={() => {
                            setEditing(instance)
                            setEditOpen(true)
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Delete ${instance.schoolName} ${title}`}
                          onClick={() => setDeleteTarget(instance)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <SectionsManager
                        classId={instance.id}
                        sections={instance.sections}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ClassFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        classItem={editing}
        schoolOptions={schoolOptions}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(value) => {
          if (!value) setDeleteTarget(null)
        }}
        title="Delete class"
        description={
          deleteTarget
            ? `This deletes ${deleteTarget.classDisplayName} at ${deleteTarget.schoolName}, including its sections. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        pending={deletePending}
        onConfirm={() => {
          if (deleteTarget) runDelete(deleteTarget.id)
        }}
      />
    </>
  )
}
