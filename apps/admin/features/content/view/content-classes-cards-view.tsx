"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import {
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import type { ContentClassSummary } from "../model/content-class-item"
import { contentClassHref } from "../model/content-class-slug"

type ContentClassesCardsViewProps = {
  classes: ContentClassSummary[]
}

function filterContentClasses(
  classes: ContentClassSummary[],
  query: string
): ContentClassSummary[] {
  const q = query.trim().toLowerCase()
  if (!q) return classes

  return classes.filter((summary) => {
    const haystack = [
      summary.classDisplayName,
      summary.className,
      ...summary.sections,
      String(summary.subjectCount),
      String(summary.chapterCount),
      String(summary.schoolCount),
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(q)
  })
}

function ContentClassCard({ summary }: { summary: ContentClassSummary }) {
  return (
    <Link
      href={contentClassHref(summary.className)}
      className={cn(
        "group flex w-full flex-col rounded-2xl border border-border/60 bg-white p-4 text-left shadow-sm ring-1 ring-black/[0.04]",
        "transition-all hover:border-[#6C5CE7]/35 hover:shadow-md hover:ring-[#6C5CE7]/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/45"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] transition-colors group-hover:bg-[#f59e0b]/15">
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
          <BookOpen className="size-3.5" aria-hidden />
          <span className="font-medium text-foreground">{summary.subjectCount}</span> subjects
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="size-3.5" aria-hidden />
          <span className="font-medium text-foreground">{summary.chapterCount}</span> chapters
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Layers className="size-3.5" aria-hidden />
          <span className="font-medium text-[#3b82f6]">{summary.schoolCount}</span>
          {summary.schoolCount === 1 ? "school" : "schools"}
        </span>
      </div>
    </Link>
  )
}

export function ContentClassesCardsView({ classes }: ContentClassesCardsViewProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(
    () => filterContentClasses(classes, search),
    [classes, search]
  )

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Open a class to view and manage its subjects, chapters, notes, and quizzes.
        Each card shows content totals across all schools offering that grade.
      </p>

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
            aria-label="Search classes for content"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>
            {filtered.length === 1 ? " class" : " classes"}
          </p>
          <Button
            type="button"
            className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Plus className="size-4" aria-hidden />
            Add content
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <BookOpen className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No classes found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {search.trim()
              ? "Try a different search term."
              : "Create classes first, then add subjects and chapters here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((summary) => (
            <ContentClassCard key={summary.key} summary={summary} />
          ))}
        </div>
      )}
    </div>
  )
}
