"use client"

import { Card, CardContent, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import Link from "next/link"

import type { SubjectCardItem } from "../model/subject-cards"
import { subjectCards } from "../model/subject-cards"

function SubjectCard({ subject }: { subject: SubjectCardItem }) {
  const percent = Math.min(
    100,
    Math.round((subject.completed / subject.total) * 100)
  )

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className={cn(
        "block rounded-2xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden rounded-2xl py-0 shadow-md ring-1 ring-black/5",
          "transition-shadow duration-200 hover:shadow-lg"
        )}
      >
        <div className="relative h-36 w-full overflow-hidden bg-muted sm:h-40">
          <Image
            src={subject.imageUrl}
            alt={subject.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center"
          />
        </div>
        <CardContent className="space-y-3 px-4 pt-3 pb-4">
          <CardTitle className="font-heading text-lg leading-tight font-bold tracking-tight text-foreground">
            {subject.title}
          </CardTitle>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Chapters completed</span>
            <span className="shrink-0 font-semibold text-foreground tabular-nums">
              {subject.completed}/{subject.total}
            </span>
          </div>
          <Progress
            value={percent}
            className={cn(
              "h-2.5 bg-violet-100/80 dark:bg-muted",
              "**:data-[slot=progress-indicator]:bg-[#6C5CE7]"
            )}
          />
        </CardContent>
      </Card>
    </Link>
  )
}

export function SubjectsView() {
  return (
    <div className="w-full">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjectCards.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  )
}
