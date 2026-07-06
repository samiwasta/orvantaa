"use client"

import { Input } from "@workspace/ui/components/input"

import Link from "next/link"
import { useMemo, useState } from "react"

import { contentHref } from "../model/content-nav"
import type { ContentBoardItem } from "../model/content-models"
import { BookOpen, ChevronRight, GraduationCap, Landmark, Search } from "lucide-react"

type ContentBoardsViewProps = {
  boards: ContentBoardItem[]
}

export function ContentBoardsView({ boards }: ContentBoardsViewProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return boards
    return boards.filter((b) =>
      [b.name, b.slug, b.kindLabel].join(" ").toLowerCase().includes(q)
    )
  }, [boards, search])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Pick a board to browse classes, subjects, chapters, notes, and quizzes.
      </p>

      <div className="relative w-full sm:max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search boards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-xl border-border/60 bg-white pl-9 shadow-sm"
          aria-label="Search boards"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <Landmark className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No boards found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add boards from the Boards page to start building content.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((board) => (
            <Link
              key={board.id}
              href={contentHref.board(board.id)}
              className="group flex flex-col rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-all hover:border-[#6C5CE7]/35 hover:shadow-md hover:ring-[#6C5CE7]/10"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
                  <Landmark className="size-5" aria-hidden />
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6C5CE7]"
                  aria-hidden
                />
              </div>
              <div className="mt-3 min-w-0">
                <p className="truncate font-heading text-base font-semibold text-foreground">
                  {board.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {board.kindLabel} · {board.slug}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <GraduationCap className="size-3.5" aria-hidden />
                  <span className="font-medium text-foreground">
                    {board.classCount}
                  </span>{" "}
                  classes
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="size-3.5" aria-hidden />
                  <span className="font-medium text-foreground">
                    {board.subjectCount}
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
