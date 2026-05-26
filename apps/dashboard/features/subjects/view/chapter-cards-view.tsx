"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { CheckCircle2, Star } from "lucide-react"
import Link from "next/link"

import type { ChapterItem, ChapterStatus } from "../model/chapter-data"
import { chapterSlug } from "../model/chapter-data"

const statusLabel: Record<ChapterStatus, string> = {
  completed: "COMPLETED",
  in_progress: "IN PROGRESS",
  not_started: "NOT STARTED",
}

function StatusIcon({ status }: { status: ChapterStatus }) {
  if (status === "completed") {
    return (
      <CheckCircle2
        className="size-5 shrink-0 text-green-600"
        strokeWidth={2}
        aria-hidden
      />
    )
  }
  if (status === "in_progress") {
    return (
      <span
        className="size-2.5 shrink-0 rounded-full bg-[#6C5CE7]"
        aria-hidden
      />
    )
  }
  return (
    <span
      className="size-2.5 shrink-0 rounded-full bg-muted-foreground/35"
      aria-hidden
    />
  )
}

function ChapterCard({
  chapter,
  subjectSlug,
}: {
  chapter: ChapterItem
  subjectSlug: string
}) {
  const { status, progressPercent, recommended } = chapter
  const href = `/subjects/${subjectSlug}/${chapterSlug(chapter)}`

  const statusTextClass =
    status === "completed"
      ? "text-green-600"
      : status === "in_progress"
        ? "text-[#6C5CE7]"
        : "text-muted-foreground"

  const action =
    status === "completed" ? (
      <Button
        asChild
        variant="outline"
        size="lg"
        className="w-full rounded-lg border-2 border-[#FF8A3D] bg-transparent text-[#FF8A3D] hover:border-[#E8722A] hover:bg-[#FF8A3D]/10 hover:text-[#E8722A] dark:hover:bg-[#FF8A3D]/12"
      >
        <Link href={href}>Review Chapter</Link>
      </Button>
    ) : (
      <Button
        asChild
        size="lg"
        className="w-full rounded-lg border-transparent bg-[#FF8A3D] text-white hover:bg-[#E8722A] active:bg-[#D96A20]"
      >
        <Link href={href}>
          {status === "in_progress" ? "Continue" : "Start"}
        </Link>
      </Button>
    )

  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-0 overflow-hidden rounded-xl py-0 shadow-md ring-1 ring-black/5",
        "transition-shadow duration-200 hover:shadow-lg"
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex h-8 shrink-0 items-center justify-between gap-2">
          <span
            className={cn(
              "text-[11px] leading-none font-semibold tracking-wide",
              statusTextClass
            )}
          >
            {statusLabel[status]}
          </span>
          <div className="flex shrink-0 items-center justify-end gap-1.5">
            {recommended ? (
              <span
                className={cn(
                  "inline-flex max-w-[min(100%,7.5rem)] items-center gap-0.5 truncate rounded-full px-2 py-0.5 text-[10px] leading-none font-semibold whitespace-nowrap",
                  "bg-[#FF8A3D]/12 text-[#E8722A] ring-1 ring-[#FF8A3D]/35",
                  "dark:bg-[#FF8A3D]/14 dark:text-[#FF8A3D] dark:ring-[#FF8A3D]/30"
                )}
              >
                <Star
                  className="size-3 shrink-0 fill-[#FF8A3D] text-[#E8722A]"
                  strokeWidth={2}
                  aria-hidden
                />
                Recommended
              </span>
            ) : null}
            <div className="flex size-6 shrink-0 items-center justify-center">
              <StatusIcon status={status} />
            </div>
          </div>
        </div>

        <div className="min-h-16 shrink-0">
          <CardTitle className="line-clamp-3 font-heading text-base leading-snug font-bold tracking-tight text-foreground">
            Chapter {chapter.number}: {chapter.title}
          </CardTitle>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground tabular-nums">
              {progressPercent}%
            </span>
          </div>
          <Progress
            value={progressPercent}
            className={cn(
              "h-2 bg-neutral-200/90 dark:bg-muted",
              "**:data-[slot=progress-indicator]:bg-[#6C5CE7]"
            )}
          />
        </div>

        {action}
      </CardContent>
    </Card>
  )
}

export function ChapterCardsView({
  chapters,
  subjectSlug,
}: {
  chapters: ChapterItem[]
  subjectSlug: string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.number}
          chapter={chapter}
          subjectSlug={subjectSlug}
        />
      ))}
    </div>
  )
}
