"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import type { BoardOption, SchoolListItem } from "../model/school-list-item"
import { deleteSchoolAction } from "../server/actions"
import { SchoolFormDialog } from "./school-form-dialog"

type SchoolsTableProps = {
  schools: SchoolListItem[]
  boardOptions: BoardOption[]
}

function filterSchools(schools: SchoolListItem[], query: string): SchoolListItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return schools

  return schools.filter((s) => {
    const haystack = [
      s.schoolCode,
      s.name,
      s.boardName,
      s.boardKindLabel,
      String(s.classCount),
      String(s.studentCount),
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function SchoolsTable({ schools, boardOptions }: SchoolsTableProps) {
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SchoolListItem | null>(null)

  const filtered = useMemo(
    () => filterSchools(schools, search),
    [schools, search]
  )

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteSchoolAction,
    {
      successMessage: "School deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(school: SchoolListItem) {
    setEditing(school)
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
            placeholder="Search schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-border/60 bg-white pl-9 shadow-sm"
            aria-label="Search schools"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>
            {filtered.length === 1 ? " school" : " schools"}
            {search.trim() ? " found" : " total"}
          </p>
          <Button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Plus className="size-4" aria-hidden />
            Add school
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  School code
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  School name
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Board
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Board type
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Classes
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Students
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-sm text-muted-foreground"
                  >
                    {search.trim()
                      ? "No schools match your search."
                      : "No schools yet. Add your first school to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((school) => (
                  <tr
                    key={school.id}
                    className="group transition-colors hover:bg-[#6C5CE7]/[0.03]"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold tracking-wide text-[#6C5CE7]">
                        {school.schoolCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground">{school.name}</p>
                    </td>
                    <td className="px-4 py-3.5">{school.boardName}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          school.boardKind === "university" ? "secondary" : "default"
                        }
                      >
                        {school.boardKindLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {school.classCount}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {school.studentCount}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                            aria-label={`Actions for ${school.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(school)}>
                            <Pencil className="size-4" aria-hidden />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(school)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SchoolFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        school={editing}
        boardOptions={boardOptions}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete school"
        description={
          deleteTarget
            ? `This permanently deletes "${deleteTarget.name}". This cannot be undone.`
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
