"use client"

import { Input } from "@workspace/ui/components/input"
import { BookOpen, ChevronRight, GraduationCap, School, Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { contentHref } from "../model/content-nav"
import type { ContentSchoolItem } from "../model/content-models"

type ContentSchoolsViewProps = {
  schools: ContentSchoolItem[]
}

export function ContentSchoolsView({ schools }: ContentSchoolsViewProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return schools
    return schools.filter((s) =>
      [s.name, s.code, s.boardName].join(" ").toLowerCase().includes(q)
    )
  }, [schools, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Pick a school to manage its classes, subjects, chapters, notes, and quizzes.
        </p>
      </div>

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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <School className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No schools found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add schools from the Schools page to start building content.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((school) => (
            <Link
              key={school.id}
              href={contentHref.school(school.id)}
              className="group flex flex-col rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-all hover:border-[#6C5CE7]/35 hover:shadow-md hover:ring-[#6C5CE7]/10"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
                  <School className="size-5" aria-hidden />
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6C5CE7]"
                  aria-hidden
                />
              </div>
              <div className="mt-3 min-w-0">
                <p className="truncate font-heading text-base font-semibold text-foreground">
                  {school.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {school.boardName} · {school.code}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <GraduationCap className="size-3.5" aria-hidden />
                  <span className="font-medium text-foreground">
                    {school.classCount}
                  </span>{" "}
                  classes
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="size-3.5" aria-hidden />
                  <span className="font-medium text-foreground">
                    {school.subjectCount}
                  </span>{" "}
                  subjects
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
