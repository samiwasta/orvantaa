"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Layers,
  Plus,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import type { ContentClassSubjectsResult } from "../model/content-subject-list-item"

type ContentSubjectsViewProps = {
  data: ContentClassSubjectsResult
}

function filterSubjects(
  subjects: ContentClassSubjectsResult["subjects"],
  query: string
) {
  const q = query.trim().toLowerCase()
  if (!q) return subjects

  return subjects.filter((subject) => {
    const haystack = [subject.title, subject.slug, String(subject.chapterCount)]
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}

function SubjectCard({
  subject,
}: {
  subject: ContentClassSubjectsResult["subjects"][number]
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.04]",
        "transition-all hover:border-[#6C5CE7]/35 hover:shadow-md hover:ring-[#6C5CE7]/10"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
          <BookOpen className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
            {subject.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subject.slug}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-3">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="size-3.5" aria-hidden />
          <span className="font-medium text-foreground">{subject.chapterCount}</span>
          {subject.chapterCount === 1 ? "chapter" : "chapters"}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Layers className="size-3.5" aria-hidden />
          <span className="font-medium text-[#3b82f6]">{subject.schoolCount}</span>
          {subject.schoolCount === 1 ? "school" : "schools"}
        </span>
        {subject.offeringCount > 1 ? (
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{subject.offeringCount}</span>{" "}
            offerings
          </span>
        ) : null}
      </div>
    </article>
  )
}

export function ContentSubjectsView({ data }: ContentSubjectsViewProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(
    () => filterSubjects(data.subjects, search),
    [data.subjects, search]
  )

  const totalChapters = data.subjects.reduce((sum, s) => sum + s.chapterCount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-fit gap-1.5 rounded-xl px-2 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/content">
              <ArrowLeft className="size-4" aria-hidden />
              All classes
            </Link>
          </Button>
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {data.classDisplayName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Subjects and chapters for this grade across{" "}
              <span className="font-medium text-foreground">{data.schoolCount}</span>{" "}
              {data.schoolCount === 1 ? "school" : "schools"}.
            </p>
            {data.sections.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.sections.map((section) => (
                  <span
                    key={section}
                    className="inline-flex rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    Section {section}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add subject
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-border/60 bg-white pl-9 shadow-sm"
            aria-label="Search subjects"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filtered.length}</span>
          {filtered.length === 1 ? " subject" : " subjects"}
          <span className="mx-2 text-border">·</span>
          <span className="font-medium text-foreground">{totalChapters}</span>
          {totalChapters === 1 ? " chapter" : " chapters"} total
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <BookOpen className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No subjects found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {search.trim()
              ? "Try a different search term."
              : "Add subjects to classes for this grade to see them here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </div>
      )}
    </div>
  )
}
