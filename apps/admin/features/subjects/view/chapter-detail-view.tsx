"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  HelpCircle,
  Lock,
  PlayCircle,
  Trophy,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import type {
  ChapterItem,
  QuizDifficulty,
  QuizItem,
  TopicItem,
  TopicStatus,
} from "../model/chapter-data"
import {
  chapterSlug,
  getLearningObjectives,
  getQuizzesForChapter,
  getTopicsForChapter,
} from "../model/chapter-data"
import { topicFirstNoteHref } from "../model/note-data"
import { quizHref } from "../model/quiz-data"

// ── Circular progress ─────────────────────────────────────────────────────────

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

// ── Progress strip ────────────────────────────────────────────────────────────

function ProgressStrip({
  completed,
  total,
  color = "#6C5CE7",
}: {
  completed: number
  total: number
  color?: string
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ── Topic row ─────────────────────────────────────────────────────────────────

const topicIconMap: Record<TopicStatus, React.ReactNode> = {
  completed: (
    <CheckCircle2
      className="size-5 shrink-0 text-emerald-500"
      strokeWidth={2}
      aria-hidden
    />
  ),
  in_progress: (
    <PlayCircle
      className="size-5 shrink-0 text-[#6C5CE7]"
      strokeWidth={2}
      aria-hidden
    />
  ),
  not_started: (
    <Circle
      className="size-5 shrink-0 text-border"
      strokeWidth={1.5}
      aria-hidden
    />
  ),
}

function TopicRow({
  subjectSlug,
  chapterSlug: chapterSlugParam,
  topic,
  index,
}: {
  subjectSlug: string
  chapterSlug: string
  topic: TopicItem
  index: number
}) {
  const locked = topic.status === "not_started"
  const href = topicFirstNoteHref(subjectSlug, chapterSlugParam, topic.id)

  const rowClassName = cn(
    "group flex items-center gap-4 rounded-xl px-4 py-4 transition-all",
    topic.status === "completed" && "cursor-pointer hover:bg-emerald-50/60",
    topic.status === "in_progress" &&
      "cursor-pointer bg-violet-50/70 ring-1 ring-[#6C5CE7]/12 hover:bg-violet-50",
    locked && "cursor-default opacity-40"
  )

  const inner = (
    <>
      {/* Step badge */}
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
          topic.status === "completed" && "bg-emerald-100 text-emerald-700",
          topic.status === "in_progress" && "bg-violet-100 text-[#6C5CE7]",
          locked && "bg-muted text-muted-foreground"
        )}
      >
        {index + 1}
      </span>

      {/* Status icon */}
      {topicIconMap[topic.status]}

      {/* Title + duration */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug font-semibold",
            locked ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {topic.title}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground/50" aria-hidden />
          <span className="text-xs text-muted-foreground">
            {topic.duration}
          </span>
        </div>
      </div>

      {/* Action */}
      {topic.status === "in_progress" && (
        <span className="inline-flex h-8 shrink-0 items-center rounded-xl bg-[#FF8A3D] px-4 text-xs font-semibold text-white shadow-sm shadow-orange-200/60">
          Continue
        </span>
      )}
      {topic.status === "completed" && (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground/25 transition-colors group-hover:text-muted-foreground/60"
          aria-hidden
        />
      )}
    </>
  )

  if (locked) {
    return <div className={rowClassName}>{inner}</div>
  }

  return (
    <Link href={href} className={rowClassName}>
      {inner}
    </Link>
  )
}

// ── Quiz row ──────────────────────────────────────────────────────────────────

const difficultyMeta: Record<
  QuizDifficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "Easy",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  },
  hard: {
    label: "Hard",
    className: "bg-red-50 text-red-700 ring-1 ring-red-200/80",
  },
}

function QuizRow({
  subjectSlug,
  chapterSlug: chapterSlugParam,
  quiz,
}: {
  subjectSlug: string
  chapterSlug: string
  quiz: QuizItem
}) {
  const locked = quiz.status === "locked"
  const completed = quiz.status === "completed"
  const href = quizHref(subjectSlug, chapterSlugParam, quiz.id)

  const rowClassName = cn(
    "group flex items-center gap-4 rounded-xl px-4 py-4 transition-all",
    locked && "cursor-default opacity-40",
    completed && "cursor-pointer bg-violet-50/50 hover:bg-violet-50/80",
    !locked && !completed && "cursor-pointer hover:bg-muted/50"
  )

  const inner = (
    <>
      {/* Icon tile */}
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          locked && "bg-muted",
          completed && "bg-emerald-100",
          !locked && !completed && "bg-violet-100"
        )}
      >
        {locked ? (
          <Lock
            className="size-4 text-muted-foreground/40"
            strokeWidth={2}
            aria-hidden
          />
        ) : completed ? (
          <Trophy
            className="size-4 text-emerald-600"
            strokeWidth={2}
            aria-hidden
          />
        ) : (
          <HelpCircle
            className="size-4 text-[#6C5CE7]"
            strokeWidth={2}
            aria-hidden
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug font-semibold",
            locked ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {quiz.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs text-muted-foreground">
            {quiz.questions} questions
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-px text-[11px] font-semibold",
              difficultyMeta[quiz.difficulty].className
            )}
          >
            {difficultyMeta[quiz.difficulty].label}
          </span>
          {quiz.score !== undefined && (
            <span className="text-xs font-semibold text-emerald-600 tabular-nums">
              {quiz.score}% scored
            </span>
          )}
        </div>
      </div>

      {/* Button */}
      {!locked && (
        <span
          className={cn(
            "inline-flex h-8 shrink-0 items-center rounded-xl px-4 text-xs font-semibold text-white shadow-sm",
            completed
              ? "bg-[#6C5CE7] shadow-violet-200/60"
              : "bg-[#FF8A3D] shadow-orange-200/60"
          )}
        >
          {completed ? "Retry" : "Start"}
        </span>
      )}
    </>
  )

  if (locked) {
    return <div className={rowClassName}>{inner}</div>
  }

  return (
    <Link href={href} className={rowClassName}>
      {inner}
    </Link>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

type Tab = "notes" | "quiz"

type ChapterDetailViewProps = {
  subjectSlug: string
  chapter: ChapterItem
}

export function ChapterDetailView({
  subjectSlug,
  chapter,
}: ChapterDetailViewProps) {
  const [tab, setTab] = useState<Tab>("notes")

  const chSlug = chapterSlug(chapter)
  const objectives = getLearningObjectives(chapter)
  const topics = getTopicsForChapter(chapter)
  const quizzes = getQuizzesForChapter(chapter)

  const completedTopics = topics.filter((t) => t.status === "completed").length
  const completedQuizzes = quizzes.filter(
    (q) => q.status === "completed"
  ).length

  const notesPct =
    topics.length === 0
      ? 0
      : Math.round((completedTopics / topics.length) * 100)
  const quizPct =
    quizzes.length === 0
      ? 0
      : Math.round((completedQuizzes / quizzes.length) * 100)

  return (
    <div className="w-full space-y-4 lg:space-y-5">
      {/* ── Page header ── */}
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

      {/* ── Custom tab bar ── */}
      <div className="border-b border-border/60">
        <div className="flex">
          <button
            onClick={() => setTab("notes")}
            className={cn(
              "relative flex items-center gap-2 border-b-2 px-1 pr-5 pb-3 text-sm font-semibold transition-colors",
              tab === "notes"
                ? "border-[#6C5CE7] text-[#6C5CE7]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="size-4" aria-hidden />
            Notes
            {completedTopics > 0 && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-px text-[10px] font-semibold text-emerald-700">
                {completedTopics}/{topics.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("quiz")}
            className={cn(
              "relative flex items-center gap-2 border-b-2 px-1 pr-5 pb-3 text-sm font-semibold transition-colors",
              tab === "quiz"
                ? "border-[#6C5CE7] text-[#6C5CE7]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <HelpCircle className="size-4" aria-hidden />
            Quiz
            {completedQuizzes > 0 && (
              <span className="rounded-full bg-violet-100 px-1.5 py-px text-[10px] font-semibold text-[#6C5CE7]">
                {completedQuizzes}/{quizzes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Tab content ── */}
      {tab === "notes" && (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-sm ring-1 ring-black/5">
          <CardContent className="p-4 sm:p-5">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {completedTopics}
                </span>{" "}
                of {topics.length} topics completed
              </p>
              <span className="text-sm font-semibold text-[#6C5CE7]">
                {notesPct}%
              </span>
            </div>
            <ProgressStrip completed={completedTopics} total={topics.length} />

            {/* List */}
            <div className="mt-3 divide-y divide-border/40">
              {topics.map((topic, i) => (
                <TopicRow
                  key={topic.id}
                  subjectSlug={subjectSlug}
                  chapterSlug={chSlug}
                  topic={topic}
                  index={i}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "quiz" && (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-sm ring-1 ring-black/5">
          <CardContent className="p-4 sm:p-5">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {completedQuizzes}
                </span>{" "}
                of {quizzes.length} quizzes completed
              </p>
              <span className="text-sm font-semibold text-[#FF8A3D]">
                {quizPct}%
              </span>
            </div>
            <ProgressStrip
              completed={completedQuizzes}
              total={quizzes.length}
              color="#FF8A3D"
            />

            {/* List */}
            <div className="mt-3 divide-y divide-border/40">
              {quizzes.map((quiz) => (
                <QuizRow
                  key={quiz.id}
                  subjectSlug={subjectSlug}
                  chapterSlug={chSlug}
                  quiz={quiz}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
