"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { MoreHorizontal, Pencil, Search, Trash2, UserPlus } from "lucide-react"
import { useMemo, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import type { SectionOption, StudentListItem } from "../model/student-list-item"
import { deleteStudentAction } from "../server/actions"
import { StudentFormDialog } from "./student-form-dialog"

type StudentsTableProps = {
  students: StudentListItem[]
  sectionOptions: SectionOption[]
}

function CellPlaceholder() {
  return <span className="text-muted-foreground/60">—</span>
}

function filterStudents(students: StudentListItem[], query: string): StudentListItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return students

  return students.filter((s) => {
    const haystack = [
      s.studentId,
      s.fullName,
      s.firstName,
      s.lastName,
      s.email,
      s.phoneNumber,
      s.schoolName,
      s.boardName,
      s.className,
      s.section,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function StudentsTable({ students, sectionOptions }: StudentsTableProps) {
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StudentListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StudentListItem | null>(null)

  const filtered = useMemo(
    () => filterStudents(students, search),
    [students, search]
  )

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteStudentAction,
    {
      successMessage: "Student deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(student: StudentListItem) {
    setEditing(student)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-border/60 bg-white pl-9 shadow-sm"
            aria-label="Search students"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>
            {filtered.length === 1 ? " student" : " students"}
            {search.trim() ? " found" : " total"}
          </p>
          <Button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <UserPlus className="size-4" aria-hidden />
            Add student
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Student ID
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Name
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Email
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Phone
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  School
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Board
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Class
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Section
                </th>
                <th className="sticky right-0 bg-muted/40 px-4 py-3.5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-sm text-muted-foreground"
                  >
                    {search.trim()
                      ? "No students match your search."
                      : "No students yet. Add your first student to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr
                    key={student.id}
                    className="group transition-colors hover:bg-[#6C5CE7]/[0.03]"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold tracking-wide text-[#6C5CE7]">
                        {student.studentId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground">{student.fullName}</p>
                    </td>
                    <td className="max-w-[200px] px-4 py-3.5">
                      <p className="truncate text-muted-foreground" title={student.email}>
                        {student.email}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {student.phoneNumber ?? <CellPlaceholder />}
                    </td>
                    <td className="px-4 py-3.5">
                      {student.schoolName ?? <CellPlaceholder />}
                    </td>
                    <td className="px-4 py-3.5">
                      {student.boardName ?? <CellPlaceholder />}
                    </td>
                    <td className="px-4 py-3.5">
                      {student.className ?? <CellPlaceholder />}
                    </td>
                    <td className="px-4 py-3.5">
                      {student.section ?? <CellPlaceholder />}
                    </td>
                    <td
                      className={cn(
                        "sticky right-0 px-4 py-3.5 text-right",
                        "bg-white group-hover:bg-[#faf9ff]"
                      )}
                    >
                      <div className="inline-flex items-center justify-end gap-0.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                              aria-label={`Actions for ${student.fullName}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(student)}>
                              <Pencil className="size-4" aria-hidden />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(student)}
                            >
                              <Trash2 className="size-4" aria-hidden />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        sectionOptions={sectionOptions}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete student"
        description={
          deleteTarget
            ? `This permanently deletes ${deleteTarget.fullName}'s account. This cannot be undone.`
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
