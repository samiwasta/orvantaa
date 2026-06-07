"use client"

import { isRichContentEmpty, RichTextContent } from "@workspace/rich-text"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
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
import { useEffect, useState } from "react"

import { trackNoteProgress } from "@/features/performance/service/activity-tracking.service"

import type { ChapterItem, TopicItem } from "../model/chapter-data"
import { chapterSlug } from "../model/chapter-data"
import { noteHref } from "../model/content-navigation"
import type { NoteBlock, NoteContent } from "../model/note-data"
import type { buildNoteNavigation } from "../model/note-navigation"
import { NoteAiTutorCard } from "./note-ai-tutor-card"
import { NoteAiTutorFab } from "./note-ai-tutor-fab"

function DefinitionBox({ title, content }: { title: string; content: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-violet-200/70 bg-linear-to-br from-violet-50 via-white to-indigo-50/80 shadow-sm">
      <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-100/50 px-4 py-2.5 sm:px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#6C5CE7] text-white shadow-sm">
          <BookMarked className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 text-sm font-semibold text-[#6C5CE7]">
          <RichTextContent html={title} studentPreview previewBlock="label" />
        </div>
        <Sparkles
          className="ml-auto size-4 text-violet-400"
          strokeWidth={2}
          aria-hidden
        />
      </div>
      <div className="px-4 py-4 sm:px-5">
        <RichTextContent html={content} studentPreview previewBlock="body" />
      </div>
    </div>
  )
}

function ExampleBox({
  title,
  body,
  tip,
}: {
  title: string
  body: string
  tip?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-sky-200/60 bg-linear-to-br from-sky-50/90 via-white to-cyan-50/50 shadow-sm">
      <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-100/40 px-4 py-2.5 sm:px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm">
          <Pencil className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 text-sm font-semibold text-sky-800">
          <RichTextContent html={title} studentPreview previewBlock="label" />
        </div>
      </div>
      {!isRichContentEmpty(body) ? (
        <div className="px-4 py-4 sm:px-5">
          <RichTextContent
            html={body}
            structured
            previewTone="sky"
            studentPreview
            previewBlock="body"
          />
        </div>
      ) : null}
      {tip && !isRichContentEmpty(tip) ? (
        <div className="mx-4 mb-4 flex gap-3 rounded-xl border-2 border-amber-200/80 bg-linear-to-r from-amber-50 to-yellow-50 px-3.5 py-3 sm:mx-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
            <Lightbulb className="size-4" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-amber-900">Pro tip</p>
            <div className="mt-0.5 text-sm leading-relaxed text-amber-950/85">
              <RichTextContent html={tip} studentPreview previewBlock="body" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ListBlockContent({ content }: { content: string }) {
  if (isRichContentEmpty(content)) return null

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 sm:p-5">
      <RichTextContent
        html={content}
        structured
        previewTone="emerald"
        studentPreview
        previewBlock="body"
      />
    </div>
  )
}

function NoteBlockRenderer({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <div className="rounded-xl bg-muted/30 px-4 py-3.5">
          <RichTextContent
            html={block.text}
            studentPreview
            previewBlock="body"
          />
        </div>
      )
    case "heading":
      return (
        <div className="flex items-start gap-2 text-lg font-semibold text-foreground sm:text-xl">
          <Star
            className="mt-1 size-5 shrink-0 fill-amber-400 text-amber-400"
            aria-hidden
          />
          <RichTextContent
            html={block.text}
            className="min-w-0 flex-1"
            studentPreview
            previewBlock="heading"
          />
        </div>
      )
    case "definition":
      return <DefinitionBox title={block.title} content={block.content} />
    case "example":
      return (
        <ExampleBox title={block.title} body={block.body} tip={block.tip} />
      )
    case "list":
      return <ListBlockContent content={block.content} />
    case "callout":
      return (
        <div className="rounded-xl border-l-4 border-[#6C5CE7] bg-violet-50 px-4 py-3.5">
          <RichTextContent
            html={block.text}
            studentPreview
            previewBlock="body"
          />
        </div>
      )
    case "quote":
      return (
        <blockquote className="border-l-2 border-violet-200 pl-4 text-muted-foreground italic">
          <RichTextContent
            html={block.text}
            studentPreview
            previewBlock="quote"
          />
        </blockquote>
      )
    case "image":
      return (
        <figure className="overflow-hidden rounded-xl ring-1 ring-black/5">
          <Image
            src={block.url}
            alt={block.alt ?? ""}
            width={800}
            height={450}
            className="h-auto w-full object-cover"
          />
        </figure>
      )
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
  navigation: ReturnType<typeof buildNoteNavigation>
}

export function NoteView({
  subjectSlug,
  chapter,
  topic,
  note,
  navigation,
}: NoteViewProps) {
  const chSlug = chapterSlug(chapter)
  const { prev, next } = navigation
  const chapterHref = `/subjects/${subjectSlug}/${chSlug}`
  const progressPct = Math.round((note.lessonNumber / note.totalLessons) * 100)
  const showTopicBadge =
    topic.title.trim().toLowerCase() !== note.title.trim().toLowerCase()
  const [aiTutorOpen, setAiTutorOpen] = useState(false)

  useEffect(() => {
    void trackNoteProgress(note.id, "VIEWED").catch((error) => {
      console.error("[note] Failed to track view:", error)
    })
  }, [note.id])

  const markNoteCompleted = () => {
    void trackNoteProgress(note.id, "COMPLETED").catch((error) => {
      console.error("[note] Failed to track completion:", error)
    })
  }

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
          <article className="note-student-preview overflow-hidden rounded-2xl border-2 border-violet-100 bg-card font-heading shadow-lg shadow-violet-200/25">
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
                  <h2 className="mt-2 font-heading text-lg leading-snug font-semibold text-white sm:text-xl">
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
                  <Link
                    href={noteHref(subjectSlug, chSlug, topic.id, next.id)}
                    onClick={markNoteCompleted}
                  >
                    <span>Next lesson</span>
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button
                  className="h-10 gap-1.5 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-300/50 hover:bg-emerald-600 active:bg-emerald-700"
                  asChild
                >
                  <Link href={chapterHref} onClick={markNoteCompleted}>
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
