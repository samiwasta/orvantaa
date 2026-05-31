"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { Eye, MoreHorizontal, Pencil, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"

import type { SchoolListItem } from "../model/school-list-item"

type SchoolsTableProps = {
  schools: SchoolListItem[]
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

export function SchoolsTable({ schools }: SchoolsTableProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(
    () => filterSchools(schools, search),
    [schools, search]
  )

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
                <th className="sticky right-0 bg-muted/40 px-4 py-3.5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          school.boardKind === "university"
                            ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                            : "bg-[#6C5CE7]/10 text-[#6C5CE7]"
                        )}
                      >
                        {school.boardKindLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {school.classCount}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {school.studentCount}
                    </td>
                    <td
                      className={cn(
                        "sticky right-0 px-4 py-3.5 text-right",
                        "bg-white group-hover:bg-[#faf9ff]"
                      )}
                    >
                      <div className="inline-flex items-center justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7]"
                          aria-label={`View ${school.name}`}
                          title="View school"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7]"
                          aria-label={`Edit ${school.name}`}
                          title="Edit school"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                          aria-label={`More actions for ${school.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
