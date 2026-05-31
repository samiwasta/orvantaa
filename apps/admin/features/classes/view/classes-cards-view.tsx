"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Plus,
  School,
  Search,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"

import {
  ALL_BOARDS,
  ALL_SCHOOLS,
  aggregateClassesByGrade,
  buildFilterOptions,
  filterClasses,
  type ClassGradeSummary,
} from "../model/classes-filters"
import type { ClassListItem, SchoolOption } from "../model/class-list-item"
import { ClassDetailSheet } from "./class-detail-sheet"
import { ClassFormDialog } from "./class-form-dialog"

type ClassesCardsViewProps = {
  classes: ClassListItem[]
  schoolOptions: SchoolOption[]
}

function ClassCard({
  summary,
  onSelect,
}: {
  summary: ClassGradeSummary
  onSelect: (item: ClassGradeSummary) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(summary)}
      className={cn(
        "group flex w-full flex-col rounded-2xl border border-border/60 bg-white p-4 text-left shadow-sm ring-1 ring-black/[0.04]",
        "transition-all hover:border-[#6C5CE7]/35 hover:shadow-md hover:ring-[#6C5CE7]/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/45"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981] transition-colors group-hover:bg-[#10b981]/15">
          <GraduationCap className="size-5" aria-hidden />
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6C5CE7]"
          aria-hidden
        />
      </div>

      <div className="mt-3 min-w-0">
        <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {summary.classDisplayName}
        </p>
        {summary.sections.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summary.sections.map((section) => (
              <span
                key={section}
                className="inline-flex rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {section}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-3">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3.5" aria-hidden />
          <span className="font-medium text-foreground">{summary.studentCount}</span> students
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="size-3.5" aria-hidden />
          <span className="font-medium text-foreground">{summary.subjectCount}</span> subjects
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <School className="size-3.5" aria-hidden />
          <span className="font-medium text-[#3b82f6]">{summary.schoolCount}</span>
          {summary.schoolCount === 1 ? "school" : "schools"}
        </span>
      </div>
    </button>
  )
}

export function ClassesCardsView({
  classes,
  schoolOptions,
}: ClassesCardsViewProps) {
  const [search, setSearch] = useState("")
  const [schoolFilter, setSchoolFilter] = useState(ALL_SCHOOLS)
  const [boardFilter, setBoardFilter] = useState(ALL_BOARDS)
  const [selectedSummary, setSelectedSummary] = useState<ClassGradeSummary | null>(
    null
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const { schools: filterSchoolOptions, boards: boardOptions } = useMemo(
    () => buildFilterOptions(classes),
    [classes]
  )

  const filtered = useMemo(
    () => filterClasses(classes, search, schoolFilter, boardFilter),
    [classes, search, schoolFilter, boardFilter]
  )

  const gradeSummaries = useMemo(
    () => aggregateClassesByGrade(filtered),
    [filtered]
  )

  const uniqueSchoolCount = useMemo(
    () => new Set(filtered.map((c) => c.schoolId)).size,
    [filtered]
  )

  const selectClassName =
    "h-10 rounded-xl border border-border/60 bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/40"

  function handleSelectSummary(summary: ClassGradeSummary) {
    setSelectedSummary(summary)
    setSheetOpen(true)
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Each card is a class grade (e.g. Class 6–10). The footer shows how many schools
          offer it. Tap a card for details across all schools.
        </p>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:max-w-xs">
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
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className={cn(selectClassName, "w-full sm:w-auto sm:min-w-[180px]")}
              aria-label="Filter by school"
            >
              <option value={ALL_SCHOOLS}>All schools</option>
              {filterSchoolOptions.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              className={cn(selectClassName, "w-full sm:w-auto sm:min-w-[160px]")}
              aria-label="Filter by board"
            >
              <option value={ALL_BOARDS}>All boards</option>
              {boardOptions.map((board) => (
                <option key={board} value={board}>
                  {board}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{gradeSummaries.length}</span>
              {gradeSummaries.length === 1 ? " class" : " classes"}
              <span className="text-muted-foreground/80">
                {" "}
                · {uniqueSchoolCount} {uniqueSchoolCount === 1 ? "school" : "schools"}
              </span>
            </p>
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
            >
              <Plus className="size-4" aria-hidden />
              Add class
            </Button>
          </div>
        </div>

        {gradeSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
            <GraduationCap className="size-10 text-muted-foreground/40" aria-hidden />
            <p className="mt-4 text-sm font-medium text-foreground">No classes found</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search.trim() || schoolFilter !== ALL_SCHOOLS || boardFilter !== ALL_BOARDS
                ? "Try adjusting your search or filters."
                : "Add Class 6–10 and sections for each school to get started."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gradeSummaries.map((summary) => (
              <ClassCard
                key={summary.key}
                summary={summary}
                onSelect={handleSelectSummary}
              />
            ))}
          </div>
        )}
      </div>

      <ClassDetailSheet
        summary={selectedSummary}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        schoolOptions={schoolOptions}
      />

      <ClassFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        schoolOptions={schoolOptions}
      />
    </>
  )
}
