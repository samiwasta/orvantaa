"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ListChecks,
  Pencil,
  Sparkles,
  Star,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import type { ChapterItem, TopicItem } from "../model/chapter-data"
import { chapterSlug } from "../model/chapter-data"
import type { NoteBlock, NoteContent } from "../model/note-data"
import { getNoteNavigation, noteHref } from "../model/note-data"
import { NoteAiTutorCard } from "./note-ai-tutor-card"
import { NoteAiTutorFab } from "./note-ai-tutor-fab"

const stepColors = [
  "bg-violet-100 text-[#6C5CE7] ring-violet-200/80",
  "bg-sky-100 text-sky-700 ring-sky-200/80",
  "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
  "bg-amber-100 text-amber-700 ring-amber-200/80",
  "bg-rose-100 text-rose-700 ring-rose-200/80",
]

function DefinitionBox({ title, content }: { title: string; content: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-violet-200/70 bg-linear-to-br from-violet-50 via-white to-indigo-50/80 shadow-sm">
      <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-100/50 px-4 py-2.5 sm:px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#6C5CE7] text-white shadow-sm">
          <BookMarked className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="text-sm font-semibold text-[#6C5CE7]">{title}</p>
        <Sparkles
          className="ml-auto size-4 text-violet-400"
          strokeWidth={2}
          aria-hidden
        />
      </div>
      <p className="px-4 py-4 text-sm leading-relaxed text-foreground/90 sm:px-5 sm:text-[15px] sm:leading-7">
        {content}
      </p>
    </div>
  )
}

function ExampleBox({
  title,
  steps,
  tip,
}: {
  title: string
  steps: string[]
  tip?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-sky-200/60 bg-linear-to-br from-sky-50/90 via-white to-cyan-50/50 shadow-sm">
      <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-100/40 px-4 py-2.5 sm:px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm">
          <Pencil className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="text-sm font-semibold text-sky-800">{title}</p>
      </div>
      <ol className="space-y-3 px-4 py-4 sm:px-5">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2",
                stepColors[i % stepColors.length]
              )}
            >
              {i + 1}
            </span>
            <span className="pt-0.5 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
              {step}
            </span>
          </li>
        ))}
      </ol>
      {tip ? (
        <div className="mx-4 mb-4 flex gap-3 rounded-xl border-2 border-amber-200/80 bg-linear-to-r from-amber-50 to-yellow-50 px-3.5 py-3 sm:mx-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
            <Lightbulb className="size-4" strokeWidth={2.5} aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold text-amber-900">Pro tip</p>
            <p className="mt-0.5 text-sm leading-relaxed text-amber-950/85">
              {tip}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FunList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 sm:p-5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </span>
          <span className="text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

function NoteBlockRenderer({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="rounded-xl bg-muted/30 px-4 py-3.5 text-sm leading-relaxed text-foreground/90 sm:text-[15px] sm:leading-7">
          {block.text}
        </p>
      )
    case "heading":
      return (
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
          <Star
            className="size-5 shrink-0 fill-amber-400 text-amber-400"
            aria-hidden
          />
          {block.text}
        </h3>
      )
    case "definition":
      return <DefinitionBox title={block.title} content={block.content} />
    case "example":
      return (
        <ExampleBox title={block.title} steps={block.steps} tip={block.tip} />
      )
    case "list":
      return <FunList items={block.items} />
    default:
      return null
  }
}

function LessonProgressDots({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 rounded-full transition-all",
            i + 1 === current
              ? "w-6 bg-[#6C5CE7]"
              : i + 1 < current
                ? "w-2 bg-emerald-400"
                : "w-2 bg-violet-200"
          )}
        />
      ))}
    </div>
  )
}

type NoteViewProps = {
  subjectSlug: string
  chapter: ChapterItem
  topic: TopicItem
  note: NoteContent
}

export function NoteView({ subjectSlug, chapter, topic, note }: NoteViewProps) {
  const chSlug = chapterSlug(chapter)
  const { prev, next } = getNoteNavigation(chSlug, topic.id, note.id)
  const chapterHref = `/subjects/${subjectSlug}/${chSlug}`
  const progressPct = Math.round((note.lessonNumber / note.totalLessons) * 100)
  const showTopicBadge =
    topic.title.trim().toLowerCase() !== note.title.trim().toLowerCase()
  const [aiTutorOpen, setAiTutorOpen] = useState(false)

  return (
    <div className="w-full">
      <div>
        <Link
          href={chapterHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to Topic List
        </Link>

        <div className="mt-2">
          <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-[#6C5CE7] md:px-2.5 md:text-xs">
            Chapter {chapter.number}
          </span>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground md:mt-1.5 md:text-2xl lg:text-3xl">
            {chapter.title}
          </h1>
        </div>
      </div>

      <div
        className={cn(
          "mt-5",
          aiTutorOpen &&
            "grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start xl:gap-6"
        )}
      >
        <div className="min-w-0">
          <article className="overflow-hidden rounded-2xl border-2 border-violet-100 bg-card shadow-lg shadow-violet-200/25">
            {/* Colorful lesson header */}
            <div className="relative overflow-hidden bg-linear-to-br from-[#6C5CE7] via-[#7c6ff0] to-[#9b8cf5] px-4 py-5 sm:px-6 sm:py-6">
              <div
                className="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-white/10"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute right-20 bottom-0 size-16 rounded-full bg-white/5"
                aria-hidden
              />

              <div className="relative flex items-start gap-4">
                <div className="hidden shrink-0 sm:block">
                  <Image
                    src="/open-book.svg"
                    alt=""
                    width={72}
                    height={72}
                    className="drop-shadow-lg"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                      <Sparkles className="size-3" aria-hidden />
                      Lesson {note.lessonNumber} of {note.totalLessons}
                    </span>
                    {showTopicBadge ? (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/90">
                        {topic.title}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-lg leading-snug font-semibold text-white sm:text-xl">
                    {note.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-white/75">
                    You&apos;re doing great — keep reading to unlock the next
                    part.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <LessonProgressDots
                      current={note.lessonNumber}
                      total={note.totalLessons}
                    />
                    <span className="text-xs font-semibold text-white/80">
                      {progressPct}% through this topic
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reading body */}
            <div className="space-y-5 bg-linear-to-b from-violet-50/30 to-transparent px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-violet-100">
                <ListChecks
                  className="size-4 shrink-0 text-[#6C5CE7]"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Read each section below — definitions and examples help you
                  remember faster.
                </span>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {note.blocks.map((block, i) => (
                  <NoteBlockRenderer key={`${block.type}-${i}`} block={block} />
                ))}
              </div>

              {!next && (
                <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-200/80 bg-emerald-50 px-4 py-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Star
                      className="size-5 fill-white"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                  <p className="text-sm font-medium text-emerald-900">
                    Nice work finishing this lesson. Hit Finish to return to
                    your chapter and try a quiz.
                  </p>
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-3 border-t border-violet-100 bg-violet-50/40 px-4 py-4 sm:px-6">
              {prev ? (
                <Button
                  variant="outline"
                  className="h-10 gap-1 rounded-xl border-violet-200 bg-white px-4 text-sm font-semibold text-[#6C5CE7] shadow-sm hover:bg-violet-50"
                  asChild
                >
                  <Link href={noteHref(subjectSlug, chSlug, topic.id, prev.id)}>
                    <ChevronLeft className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Link>
                </Button>
              ) : (
                <div />
              )}

              {next ? (
                <Button
                  className="h-10 gap-1.5 rounded-xl bg-[#FF8A3D] px-5 text-sm font-semibold text-white shadow-md shadow-orange-300/50 hover:bg-[#E8722A] active:bg-[#D96A20]"
                  asChild
                >
                  <Link href={noteHref(subjectSlug, chSlug, topic.id, next.id)}>
                    <span>Next lesson</span>
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button
                  className="h-10 gap-1.5 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-300/50 hover:bg-emerald-600 active:bg-emerald-700"
                  asChild
                >
                  <Link href={chapterHref}>
                    <span>Finish topic</span>
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              )}
            </div>
          </article>
        </div>

        {aiTutorOpen ? (
          <aside className="hidden min-w-0 xl:sticky xl:top-6 xl:block xl:self-start">
            <NoteAiTutorCard
              lessonTitle={note.title}
              onClose={() => setAiTutorOpen(false)}
            />
          </aside>
        ) : null}
      </div>

      <NoteAiTutorFab
        open={aiTutorOpen}
        onOpenChange={setAiTutorOpen}
        lessonTitle={note.title}
      />
    </div>
  )
}
