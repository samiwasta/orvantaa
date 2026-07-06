"use client"

import Link from "next/link"

import { contentHref } from "../model/content-nav"
import type { ContentBoardRef, ContentClassItem } from "../model/content-models"
import { BookOpen, ChevronRight, GraduationCap, School } from "lucide-react"

type ContentClassesViewProps = {
  board: ContentBoardRef
  classes: ContentClassItem[]
}

export function ContentClassesView({ board, classes }: ContentClassesViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Classes under{" "}
        <span className="font-medium text-foreground">{board.name}</span>. Pick a
        class to manage its subjects.
      </p>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <GraduationCap className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No classes yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add schools and classes from the Schools and Classes pages.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {classes.map((classItem) => (
            <Link
              key={classItem.id}
              href={contentHref.class(board.id, classItem.id)}
              className="group flex flex-col rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-all hover:border-[#6C5CE7]/35 hover:shadow-md hover:ring-[#6C5CE7]/10"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
                  <GraduationCap className="size-5" aria-hidden />
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6C5CE7]"
                  aria-hidden
                />
              </div>
              <p className="mt-3 font-heading text-lg font-semibold text-foreground">
                {classItem.displayName}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <School className="size-3.5" aria-hidden />
                  <span className="font-medium text-foreground">
                    {classItem.schoolCount}
                  </span>{" "}
                  {classItem.schoolCount === 1 ? "school" : "schools"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="size-3.5" aria-hidden />
                  <span className="font-medium text-foreground">
                    {classItem.subjectCount}
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
