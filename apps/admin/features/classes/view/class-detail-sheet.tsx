"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import {
  BookOpen,
  GraduationCap,
  Pencil,
  Search,
  Users,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  groupInstancesBySchool,
  type ClassGradeSummary,
} from "../model/classes-filters"

type ClassDetailSheetProps = {
  summary: ClassGradeSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SCHOOL_SEARCH_THRESHOLD = 5

function filterSchoolOfferings(
  schools: ReturnType<typeof groupInstancesBySchool>,
  query: string
) {
  const q = query.trim().toLowerCase()
  if (!q) return schools

  return schools.filter((school) => {
    const haystack = [
      school.schoolName,
      school.schoolCode,
      school.boardName,
      ...school.sections,
      String(school.studentCount),
      String(school.subjectCount),
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function ClassDetailSheet({
  summary,
  open,
  onOpenChange,
}: ClassDetailSheetProps) {
  const [schoolSearch, setSchoolSearch] = useState("")

  useEffect(() => {
    setSchoolSearch("")
  }, [summary?.key])

  const schoolOfferings = useMemo(
    () => (summary ? groupInstancesBySchool(summary.instances) : []),
    [summary]
  )

  const filteredSchools = useMemo(
    () => filterSchoolOfferings(schoolOfferings, schoolSearch),
    [schoolOfferings, schoolSearch]
  )

  const showSchoolSearch = schoolOfferings.length >= SCHOOL_SEARCH_THRESHOLD

  const title = summary ? summary.classDisplayName : "Class details"

  return (
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
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-3">
                {showSchoolSearch ? (
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      type="search"
                      placeholder="Search schools..."
                      value={schoolSearch}
                      onChange={(e) => setSchoolSearch(e.target.value)}
                      className="h-9 rounded-lg border-border/60 bg-white pl-8 text-sm shadow-sm"
                      aria-label="Search schools in this class"
                    />
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/15">
                  {filteredSchools.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No schools match your search.
                    </p>
                  ) : (
                    <ul
                      className={cn(
                        "divide-y divide-border/50",
                        schoolOfferings.length > 6 &&
                          "max-h-[min(360px,50vh)] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5"
                      )}
                    >
                      {filteredSchools.map((school) => (
                        <li
                          key={school.schoolId}
                          className="flex items-center gap-3 bg-white px-3 py-2.5 transition-colors hover:bg-[#6C5CE7]/[0.03]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {school.schoolName}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {school.boardName} · {school.schoolCode}
                            </p>
                            {school.sections.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {school.sections.map((section) => (
                                  <span
                                    key={section}
                                    className="inline-flex rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-foreground"
                                  >
                                    {section}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <div className="shrink-0 text-right text-[11px] leading-tight text-muted-foreground">
                            <p>
                              <span className="font-semibold text-foreground">
                                {school.studentCount}
                              </span>{" "}
                              st
                            </p>
                            <p>
                              <span className="font-semibold text-foreground">
                                {school.subjectCount}
                              </span>{" "}
                              sub
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border/50 bg-white px-6 py-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 flex-1 rounded-xl"
                  >
                    <Users className="size-4" aria-hidden />
                    View students
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 flex-1 rounded-xl"
                  >
                    <BookOpen className="size-4" aria-hidden />
                    Manage subjects
                  </Button>
                </div>
                <Button
                  type="button"
                  className="h-10 w-full rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
                >
                  <Pencil className="size-4" aria-hidden />
                  Edit class
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
