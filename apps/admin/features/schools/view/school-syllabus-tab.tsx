"use client"

import { Button } from "@workspace/ui/components/button"

import Link from "next/link"
import { useState } from "react"

import { deleteClassAction } from "@/features/classes/server/actions"
import { contentHref } from "@/features/content/model/content-nav"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"
import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { BoardClassOption } from "../model/board-class-option"
import type { SchoolSyllabusClassRow } from "../model/school-student-list-item"
import { SchoolAddClassesDialog } from "./school-add-classes-dialog"
import { Plus, Trash2 } from "lucide-react"

type SchoolSyllabusSchoolProps = {
  schoolId: string
  schoolCode: string
  schoolName: string
  boardId: string
  boardName: string
  boardClassOptions: BoardClassOption[]
}

type SchoolSyllabusTabProps = {
  boardId: string
  schoolCode: string
  rows: SchoolSyllabusClassRow[]
}

export function SchoolSyllabusAddClassButton({
  schoolId,
  schoolCode,
  schoolName,
  boardId,
  boardName,
  boardClassOptions,
}: SchoolSyllabusSchoolProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="mr-5 h-9 shrink-0 rounded-lg bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90 sm:mr-6"
      >
        <Plus className="size-4" aria-hidden />
        Add class
      </Button>
      <SchoolAddClassesDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        schoolId={schoolId}
        schoolCode={schoolCode}
        schoolName={schoolName}
        boardId={boardId}
        boardName={boardName}
        options={boardClassOptions}
      />
    </>
  )
}

export function SchoolSyllabusTab({
  boardId,
  schoolCode,
  rows,
}: SchoolSyllabusTabProps) {
  const [deleteTarget, setDeleteTarget] = useState<SchoolSyllabusClassRow | null>(null)

  const { run: runDelete, pending: deletePending } = useActionRunner(
    (id: string) => deleteClassAction(id, schoolCode),
    {
      successMessage: "Class deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Class
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Subjects
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No classes yet. Add classes to manage syllabus content.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const assigned = row.subjectCount > 0
                  return (
                    <tr key={row.classId}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.classDisplayName}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {row.subjectCount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            assigned
                              ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                              : "inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"
                          }
                        >
                          {assigned ? "Assigned" : "Not Assigned"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-border/60 px-3 text-xs font-medium transition-colors hover:border-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white"
                            asChild
                          >
                            <Link
                              href={contentHref.class(boardId, row.classId)}
                              aria-label={`Manage syllabus for ${row.classDisplayName}`}
                            >
                              Manage
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${row.classDisplayName}`}
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Manage subjects in{" "}
        <Link href={contentHref.root()} className="font-medium text-[#6C5CE7] hover:underline">
          Content
        </Link>
        . Classes with subjects must have content removed before deletion.
      </p>

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
          if (deleteTarget) runDelete(deleteTarget.classId)
        }}
      />
    </div>
  )
}
