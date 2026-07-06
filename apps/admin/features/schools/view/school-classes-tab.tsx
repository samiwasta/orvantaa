"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { useState } from "react"

import type { ClassListItem, ClassSectionItem } from "@/features/classes/model/class-list-item"
import { ClassFormDialog } from "@/features/classes/view/class-form-dialog"
import { SectionFormDialog } from "@/features/classes/view/section-form-dialog"
import {
  deleteClassAction,
  deleteSectionAction,
} from "@/features/classes/server/actions"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"
import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { BoardClassOption } from "../model/board-class-option"
import { SchoolAddClassesDialog } from "./school-add-classes-dialog"
import { Pencil, Plus, Trash2, Users } from "lucide-react"

type SchoolClassesTabProps = {
  schoolId: string
  schoolCode: string
  schoolName: string
  boardId: string
  boardName: string
  boardClassOptions: BoardClassOption[]
  classes: ClassListItem[]
}

type SectionDialogState = {
  classItem: ClassListItem
  section: ClassSectionItem | null
} | null

type DeleteTarget =
  | { type: "class"; item: ClassListItem }
  | { type: "section"; classItem: ClassListItem; section: ClassSectionItem }
  | null

export function SchoolClassesAddButton({
  schoolId,
  schoolCode,
  schoolName,
  boardId,
  boardName,
  boardClassOptions,
}: Omit<SchoolClassesTabProps, "classes">) {
  const [addBoardOpen, setAddBoardOpen] = useState(false)
  const [addCustomOpen, setAddCustomOpen] = useState(false)

  return (
    <>
      <div className="mr-5 flex shrink-0 items-center gap-2 sm:mr-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setAddCustomOpen(true)}
          className="hidden h-9 rounded-lg px-3 text-sm font-medium sm:inline-flex"
        >
          Custom class
        </Button>
        <Button
          type="button"
          onClick={() => setAddBoardOpen(true)}
          className="h-9 rounded-lg bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add class
        </Button>
      </div>

      <SchoolAddClassesDialog
        open={addBoardOpen}
        onOpenChange={setAddBoardOpen}
        schoolId={schoolId}
        schoolCode={schoolCode}
        schoolName={schoolName}
        boardId={boardId}
        boardName={boardName}
        options={boardClassOptions}
      />

      <ClassFormDialog
        open={addCustomOpen}
        onOpenChange={setAddCustomOpen}
        schoolOptions={[{ id: schoolId, name: schoolName }]}
        defaultSchoolId={schoolId}
        defaultSchoolName={schoolName}
        revalidateSchoolCode={schoolCode}
      />
    </>
  )
}

export function SchoolClassesTab({
  schoolId,
  schoolCode,
  schoolName,
  classes,
}: Pick<SchoolClassesTabProps, "schoolId" | "schoolCode" | "schoolName" | "classes">) {
  const [editClass, setEditClass] = useState<ClassListItem | null>(null)
  const [sectionDialog, setSectionDialog] = useState<SectionDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)

  const { run: runDeleteClass, pending: deleteClassPending } = useActionRunner(
    (id: string) => deleteClassAction(id, schoolCode),
    {
      successMessage: "Class deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  const { run: runDeleteSection, pending: deleteSectionPending } = useActionRunner(
    (id: string) => deleteSectionAction(id, schoolCode),
    {
      successMessage: "Section removed",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  const deletePending = deleteClassPending || deleteSectionPending

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Manage grades and sections for {schoolName}. Students are assigned to
        sections from the Students tab.
      </p>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Class
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Sections
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Students
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Subjects
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {classes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No classes yet. Add classes to create sections and enroll
                    students.
                  </td>
                </tr>
              ) : (
                classes.map((classItem) => (
                  <ClassRow
                    key={classItem.id}
                    classItem={classItem}
                    onEditClass={setEditClass}
                    onAddSection={(item) =>
                      setSectionDialog({ classItem: item, section: null })
                    }
                    onEditSection={(item, section) =>
                      setSectionDialog({ classItem: item, section })
                    }
                    onDeleteClass={(item) =>
                      setDeleteTarget({ type: "class", item })
                    }
                    onDeleteSection={(item, section) =>
                      setDeleteTarget({ type: "section", classItem: item, section })
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClassFormDialog
        open={Boolean(editClass)}
        onOpenChange={(open) => {
          if (!open) setEditClass(null)
        }}
        classItem={editClass}
        schoolOptions={[{ id: schoolId, name: schoolName }]}
        revalidateSchoolCode={schoolCode}
      />

      {sectionDialog ? (
        <SectionFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setSectionDialog(null)
          }}
          classId={sectionDialog.classItem.id}
          classDisplayName={sectionDialog.classItem.classDisplayName}
          section={sectionDialog.section}
          schoolCode={schoolCode}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={
          deleteTarget?.type === "section" ? "Remove section" : "Delete class"
        }
        description={
          deleteTarget?.type === "class"
            ? `This deletes ${deleteTarget.item.classDisplayName}, including its sections. This cannot be undone.`
            : deleteTarget?.type === "section"
              ? `Remove section ${deleteTarget.section.name} from ${deleteTarget.classItem.classDisplayName}?`
              : undefined
        }
        confirmLabel={deleteTarget?.type === "section" ? "Remove" : "Delete"}
        destructive
        pending={deletePending}
        onConfirm={() => {
          if (!deleteTarget) return
          if (deleteTarget.type === "class") {
            runDeleteClass(deleteTarget.item.id)
          } else {
            runDeleteSection(deleteTarget.section.id)
          }
        }}
      />
    </div>
  )
}

function ClassRow({
  classItem,
  onEditClass,
  onAddSection,
  onEditSection,
  onDeleteClass,
  onDeleteSection,
}: {
  classItem: ClassListItem
  onEditClass: (item: ClassListItem) => void
  onAddSection: (item: ClassListItem) => void
  onEditSection: (item: ClassListItem, section: ClassSectionItem) => void
  onDeleteClass: (item: ClassListItem) => void
  onDeleteSection: (item: ClassListItem, section: ClassSectionItem) => void
}) {
  return (
    <tr>
      <td className="px-4 py-3 align-top font-medium text-foreground">
        {classItem.classDisplayName}
      </td>
      <td className="px-4 py-3 align-top">
        {classItem.sections.length === 0 ? (
          <span className="text-muted-foreground">No sections</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {classItem.sections.map((section) => (
              <span
                key={section.id}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-xs font-medium text-foreground"
              >
                {section.name}
                <span className="text-muted-foreground">· {section.studentCount}</span>
                <button
                  type="button"
                  onClick={() => onEditSection(classItem, section)}
                  className="rounded p-0.5 text-muted-foreground hover:text-[#6C5CE7]"
                  aria-label={`Edit section ${section.name}`}
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSection(classItem, section)}
                  disabled={section.studentCount > 0}
                  className={cn(
                    "rounded p-0.5 text-muted-foreground hover:text-destructive",
                    section.studentCount > 0 && "cursor-not-allowed opacity-40"
                  )}
                  aria-label={`Remove section ${section.name}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top tabular-nums text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          {classItem.studentCount}
        </span>
      </td>
      <td className="px-4 py-3 align-top tabular-nums text-muted-foreground">
        {classItem.subjectCount}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-border/60 px-3 text-xs font-medium"
            onClick={() => onAddSection(classItem)}
          >
            <Plus className="size-3.5" aria-hidden />
            Section
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-[#6C5CE7]"
            aria-label={`Edit ${classItem.classDisplayName}`}
            onClick={() => onEditClass(classItem)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive",
              classItem.subjectCount > 0 && "opacity-40"
            )}
            aria-label={`Delete ${classItem.classDisplayName}`}
            disabled={classItem.subjectCount > 0}
            onClick={() => onDeleteClass(classItem)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
