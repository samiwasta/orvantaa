"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { BookOpen, GraduationCap, Plus, Search, Trash2, Users } from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"
import { useActionRunner } from "@/lib/actions/use-action-runner"

import {
  type ClassListItem,
  compareClassListItems,
  type SchoolOption,
} from "../model/class-list-item"
import { filterClasses } from "../model/classes-filters"
import { deleteClassAction } from "../server/actions"
import { ClassFormDialog } from "./class-form-dialog"
import { ClassManageDialog } from "./class-manage-dialog"

type ClassesCardsViewProps = {
  classes: ClassListItem[]
  schoolOptions: SchoolOption[]
}

function ClassCard({
  classItem,
  onEdit,
  onDelete,
}: {
  classItem: ClassListItem
  onEdit: (item: ClassListItem) => void
  onDelete: (item: ClassListItem) => void
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]",
        "transition-all hover:border-[#6C5CE7]/35 hover:shadow-md hover:ring-[#6C5CE7]/10"
      )}
    >
      <button
        type="button"
        onClick={() => onEdit(classItem)}
        className={cn(
          "flex w-full items-center gap-3 px-3.5 py-3 pr-11 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/45 focus-visible:ring-offset-2 rounded-xl"
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#10b981]/10 text-[#10b981] transition-colors group-hover:bg-[#10b981]/15">
          <GraduationCap className="size-4.5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
            {classItem.classDisplayName}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3 shrink-0" aria-hidden />
              <span className="font-medium text-foreground">{classItem.studentCount}</span>
              students
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3 shrink-0" aria-hidden />
              <span className="font-medium text-foreground">{classItem.subjectCount}</span>
              subjects
            </span>
          </p>
        </div>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 right-2 size-8 -translate-y-1/2 rounded-lg text-muted-foreground",
          "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          "hover:bg-destructive/10 hover:text-destructive"
        )}
        aria-label={`Delete ${classItem.classDisplayName}`}
        onClick={() => onDelete(classItem)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

export function ClassesCardsView({
  classes,
  schoolOptions,
}: ClassesCardsViewProps) {
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState<ClassListItem | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ClassListItem | null>(null)

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteClassAction,
    {
      successMessage: "Class deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  const filtered = useMemo(() => {
    const result = filterClasses(classes, search)
    return [...result].sort(compareClassListItems)
  }, [classes, search])

  function handleEdit(classItem: ClassListItem) {
    setSelectedClass(classItem)
    setManageOpen(true)
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-border/60 bg-white pl-9 shadow-sm"
              aria-label="Search classes"
            />
          </div>

          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-10 shrink-0 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Plus className="size-4" aria-hidden />
            Add class
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
            <GraduationCap className="size-10 text-muted-foreground/40" aria-hidden />
            <p className="mt-4 text-sm font-medium text-foreground">No classes found</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search.trim()
                ? "Try a different search term."
                : "Add a class to get started."}
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      <ClassManageDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        classItem={selectedClass}
      />

      <ClassFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        schoolOptions={schoolOptions}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete class"
        description={
          deleteTarget
            ? `This deletes ${deleteTarget.classDisplayName}, including its sections. This cannot be undone.`
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
