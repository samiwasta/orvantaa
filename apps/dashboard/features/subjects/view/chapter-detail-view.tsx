"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import type {
  ChapterItem,
  QuizDifficulty,
  QuizItem,
  TopicItem,
} from "../model/chapter-data"
import { chapterSlug, isTimedQuiz } from "../model/chapter-data"
import { quizHref, topicFirstNoteHref } from "../model/content-navigation"

type Tab = "notes" | "quiz"

type ChapterDetailViewProps = {
  subjectSlug: string
  chapter: ChapterItem
  topics: TopicItem[]
  quizzes: QuizItem[]
  objectives: string[]
}

const difficultyLabel: Record<QuizDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

function CircularProgress({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const vb = 100
  const stroke = 7
  const radius = (vb - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      className={cn(
        "relative size-14 shrink-0 md:size-16 lg:size-[72px] xl:size-24",
        className
      )}
      aria-label={`${value}% complete`}
    >
      <svg
        viewBox={`0 0 ${vb} ${vb}`}
        className="h-full w-full -rotate-90"
        aria-hidden
      >
        <circle
          cx={vb / 2}
          cy={vb / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-violet-100"
        />
        <circle
          cx={vb / 2}
          cy={vb / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[#6C5CE7] transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-sm font-semibold text-[#6C5CE7] tabular-nums sm:text-base xl:text-lg">
          {value}%
        </span>
        <span className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
          done
        </span>
      </span>
    </div>
  )
}

function TabProgress({
  label,
  completed,
  total,
}: {
  label: string
  completed: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="space-y-2.5 border-b border-[#EEF1F8] px-4 py-4 sm:px-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          {completed}
          <span className="font-normal text-muted-foreground">
            {" "}
            of {total} {label}
          </span>
        </p>
        <span className="text-sm font-semibold text-[#6C5CE7] tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF1F8]">
        <div
          className="h-full rounded-full bg-[#6C5CE7] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-4 py-10 text-center sm:px-5">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function StatusMark({
  index,
  state,
}: {
  index: number
  state: "completed" | "active" | "available" | "locked"
}) {
  if (state === "completed") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="size-5" strokeWidth={2} aria-hidden />
      </span>
    )
  }

  if (state === "locked") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F8] text-slate-400">
        <Lock className="size-4" strokeWidth={2} aria-hidden />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
        state === "active"
          ? "bg-[#6C5CE7] text-white shadow-[0_8px_18px_-10px_rgba(108,92,231,0.8)]"
          : "bg-[#F3F4F8] text-slate-500"
      )}
    >
      {index + 1}
    </span>
  )
}

function TopicRow({
  subjectSlug,
  chapterSlug: chapterSlugParam,
  topic,
  index,
  isNext,
}: {
  subjectSlug: string
  chapterSlug: string
  topic: TopicItem
  index: number
  isNext: boolean
}) {
  const locked = topic.status === "not_started" || !topic.firstNoteId
  const completed = topic.status === "completed"
  const active = topic.status === "in_progress" || isNext
  const href = topicFirstNoteHref(
    subjectSlug,
    chapterSlugParam,
    topic.id,
    topic.firstNoteId
  )

  const state = locked
    ? "locked"
    : completed
      ? "completed"
      : active
        ? "active"
        : "available"

  const rowClassName = cn(
    "group block rounded-2xl px-3.5 py-3.5 transition-colors sm:px-4 sm:py-4",
    locked && "cursor-default",
    !locked && "cursor-pointer",
    active && !completed && "bg-[#F5F3FF]",
    completed && "hover:bg-emerald-50/40",
    !locked && !completed && !active && "hover:bg-[#F8F9FC]"
  )

  const action =
    active && !completed ? (
      <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#FF8A3D] text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(255,138,61,0.8)] sm:h-9 sm:w-auto sm:px-4 sm:text-xs">
        Continue
      </span>
    ) : locked ? (
      <span className="text-[11px] font-medium text-slate-400 sm:shrink-0">
        Locked
      </span>
    ) : (
      <ChevronRight
        className="hidden size-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 sm:block"
        aria-hidden
      />
    )

  const inner = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <StatusMark index={index} state={state} />

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-[15px] leading-snug font-semibold tracking-tight sm:text-sm",
                locked ? "text-slate-400" : "text-foreground"
              )}
            >
              {topic.title}
            </p>
            {active && !completed ? (
              <span className="rounded-full bg-[#6C5CE7]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6C5CE7]">
                Up next
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {topic.duration}
            {completed ? " · Completed" : ""}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "sm:shrink-0",
          active && !completed && "pl-12 sm:pl-0",
          locked && "pl-12 sm:pl-0"
        )}
      >
        {action}
      </div>
    </div>
  )

  if (locked || !href) {
    return <div className={rowClassName}>{inner}</div>
  }

  return (
    <Link href={href} className={rowClassName}>
      {inner}
    </Link>
  )
}

function QuizRow({
  subjectSlug,
  chapterSlug: chapterSlugParam,
  quiz,
  index,
  isNext,
}: {
  subjectSlug: string
  chapterSlug: string
  quiz: QuizItem
  index: number
  isNext: boolean
}) {
  const locked = quiz.status === "locked"
  const completed = quiz.status === "completed"
  const available = !locked && !completed
  const active = available && isNext
  const href = quizHref(subjectSlug, chapterSlugParam, quiz.id)
  const timed = isTimedQuiz(quiz)

  const state = locked
    ? "locked"
    : completed
      ? "completed"
      : active
        ? "active"
        : "available"

  const metaParts = [
    `${quiz.questions} questions`,
    difficultyLabel[quiz.difficulty],
    timed ? "Timed" : null,
    quiz.score !== undefined ? `${quiz.score}%` : null,
  ].filter(Boolean) as string[]

  const rowClassName = cn(
    "group block rounded-2xl px-3.5 py-3.5 transition-colors sm:px-4 sm:py-4",
    locked ? "cursor-default" : "cursor-pointer",
    active && "bg-[#F5F3FF]",
    completed && "hover:bg-emerald-50/40",
    locked && "opacity-90",
    available && !active && "hover:bg-[#F8F9FC]"
  )

  const action = active ? (
    <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#FF8A3D] text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(255,138,61,0.8)] sm:h-9 sm:w-auto sm:px-4 sm:text-xs">
      Start
    </span>
  ) : completed ? (
    <span className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#E4E9F5] bg-white text-sm font-semibold text-[#6C5CE7] transition-colors group-hover:border-[#d5dbf0] group-hover:bg-[#F7F6FF] sm:h-9 sm:w-auto sm:px-3.5 sm:text-xs">
      Retry
    </span>
  ) : locked ? (
    <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#F3F4F8] text-sm font-semibold text-slate-500 sm:h-9 sm:w-auto sm:px-3.5 sm:text-[11px]">
      Blocked
    </span>
  ) : (
    <span className="hidden sm:inline-flex">
      <ChevronRight
        className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"
        aria-hidden
      />
    </span>
  )

  const inner = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <StatusMark index={index} state={state} />

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-[15px] leading-snug font-semibold tracking-tight sm:text-sm",
                locked ? "text-slate-400" : "text-foreground"
              )}
            >
              {quiz.title}
            </p>
            {active ? (
              <span className="rounded-full bg-[#6C5CE7]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6C5CE7]">
                Up next
              </span>
            ) : null}
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "sm:shrink-0",
          (active || completed || locked) && "pl-12 sm:pl-0"
        )}
      >
        {action}
      </div>
    </div>
  )

  return (
    <Link
      href={href}
      className={rowClassName}
      aria-disabled={locked || undefined}
    >
      {inner}
    </Link>
  )
}

export function ChapterDetailView({
  subjectSlug,
  chapter,
  topics,
  quizzes,
  objectives,
}: ChapterDetailViewProps) {
  const [tab, setTab] = useState<Tab>("notes")
  const chSlug = chapterSlug(chapter)

  const completedTopics = topics.filter((t) => t.status === "completed").length
  const completedQuizzes = quizzes.filter(
    (q) => q.status === "completed"
  ).length

  const nextTopicIndex = useMemo(
    () => topics.findIndex((t) => t.status === "in_progress"),
    [topics]
  )

  const nextQuizIndex = useMemo(
    () => quizzes.findIndex((q) => q.status === "available"),
    [quizzes]
  )

  return (
    <div className="w-full space-y-4 lg:space-y-5">
      <div>
        <Link
          href={`/subjects/${subjectSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to Chapters
        </Link>

        <div className="mt-2 flex items-start justify-between gap-3 lg:mt-3 lg:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 lg:gap-3">
            <div className="flex items-start justify-between gap-3 lg:block">
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-[#6C5CE7] md:px-2.5 md:text-xs">
                  Chapter {chapter.number}
                </span>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground md:mt-1.5 md:text-2xl lg:text-3xl">
                  {chapter.title}
                </h1>
              </div>
              <CircularProgress
                value={chapter.progressPercent}
                className="lg:hidden"
              />
            </div>

            <ul className="space-y-1.5 lg:hidden">
              {objectives.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Check
                    className="size-3.5 shrink-0 text-emerald-500"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <div className="hidden flex-wrap gap-2 lg:flex">
              {objectives.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-foreground shadow-sm ring-1 ring-black/8"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <Check
                      className="size-3 text-emerald-600"
                      strokeWidth={3}
                      aria-hidden
                    />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <CircularProgress
            value={chapter.progressPercent}
            className="hidden lg:block"
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-1 rounded-2xl bg-[#F3F4F8] p-1 sm:flex sm:w-fit">
        <button
          type="button"
          onClick={() => setTab("notes")}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all sm:justify-start sm:gap-2 sm:px-3.5 sm:py-2",
            tab === "notes"
              ? "bg-white text-[#6C5CE7] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="size-4 shrink-0" aria-hidden />
          <span>Notes</span>
          {topics.length > 0 ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                tab === "notes"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-white/70 text-slate-500"
              )}
            >
              {completedTopics}/{topics.length}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setTab("quiz")}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all sm:justify-start sm:gap-2 sm:px-3.5 sm:py-2",
            tab === "quiz"
              ? "bg-white text-[#6C5CE7] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <HelpCircle className="size-4 shrink-0" aria-hidden />
          <span>Quiz</span>
          {quizzes.length > 0 ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                tab === "quiz"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-white/70 text-slate-500"
              )}
            >
              {completedQuizzes}/{quizzes.length}
            </span>
          ) : null}
        </button>
      </div>

      <Card className="gap-0 overflow-hidden rounded-[1.5rem] border border-[#E8EEFF]/90 bg-white py-0 shadow-[0_10px_30px_-18px_rgba(65,105,225,0.18)]">
        <CardContent className="p-0">
          {tab === "notes" ? (
            <>
              <TabProgress
                label="topics completed"
                completed={completedTopics}
                total={topics.length}
              />
              {topics.length === 0 ? (
                <EmptyState message="No notes have been assigned for this chapter yet." />
              ) : (
                <div className="divide-y divide-[#EEF1F8] px-1 py-1 sm:space-y-1.5 sm:divide-y-0 sm:p-2.5">
                  {topics.map((topic, i) => (
                    <TopicRow
                      key={topic.id}
                      subjectSlug={subjectSlug}
                      chapterSlug={chSlug}
                      topic={topic}
                      index={i}
                      isNext={i === nextTopicIndex}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <TabProgress
                label="quizzes completed"
                completed={completedQuizzes}
                total={quizzes.length}
              />
              {quizzes.length === 0 ? (
                <EmptyState message="No quizzes have been assigned for this chapter yet." />
              ) : (
                <div className="divide-y divide-[#EEF1F8] px-1 py-1 sm:space-y-1.5 sm:divide-y-0 sm:p-2.5">
                  {quizzes.map((quiz, i) => (
                    <QuizRow
                      key={quiz.id}
                      subjectSlug={subjectSlug}
                      chapterSlug={chSlug}
                      quiz={quiz}
                      index={i}
                      isNext={i === nextQuizIndex}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
