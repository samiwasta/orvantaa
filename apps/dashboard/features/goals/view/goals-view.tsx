"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Flag,
  Flame,
  MapPin,
  RefreshCw,
  Target,
  Trophy,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  getGoalActionLabel,
  getGoalSubtitle,
  goalProgressPercent,
} from "../model/goal-instructions"
import type { GoalsPageData, StudentGoal } from "../model/student-goal"

type GoalsViewProps = {
  data: GoalsPageData
}

function formatExamDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

function formatPeriodEnd(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(date))
}

function goalTypeIcon(type: StudentGoal["type"]) {
  switch (type) {
    case "MAINTAIN_STREAK":
      return Flame
    case "PASS_QUIZ":
      return Trophy
    case "COMPLETE_CHAPTERS":
      return BookOpen
    default:
      return Target
  }
}

export function GoalsView({ data: initialData }: GoalsViewProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [examName, setExamName] = useState(data.examTarget?.examName ?? "")
  const [examDate, setExamDate] = useState(
    data.examTarget
      ? new Date(data.examTarget.examDate).toISOString().slice(0, 10)
      : ""
  )
  const [savingExam, setSavingExam] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [dismissingId, setDismissingId] = useState<string | null>(null)
  const [examError, setExamError] = useState<string | null>(null)

  async function saveExamTarget(event: React.FormEvent) {
    event.preventDefault()
    setExamError(null)
    setSavingExam(true)

    try {
      const response = await fetch("/api/goals/exam-target", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examName, examDate }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setExamError(payload.error ?? "Could not save exam target.")
        return
      }

      setData(payload)
      router.refresh()
    } catch {
      setExamError("Could not save exam target.")
    } finally {
      setSavingExam(false)
    }
  }

  async function regenerateGoals() {
    setRegenerating(true)
    try {
      const response = await fetch("/api/goals/regenerate", { method: "POST" })
      const payload = await response.json()
      if (response.ok) {
        setData(payload)
        router.refresh()
      }
    } finally {
      setRegenerating(false)
    }
  }

  async function dismissGoal(goalId: string) {
    setDismissingId(goalId)
    try {
      const response = await fetch(`/api/goals/${goalId}`, { method: "PATCH" })
      if (response.ok) {
        setData((current) => ({
          ...current,
          activeGoals: current.activeGoals.filter((goal) => goal.id !== goalId),
          journey: {
            ...current.journey,
            activeSteps: Math.max(0, current.journey.activeSteps - 1),
          },
        }))
        router.refresh()
      }
    } finally {
      setDismissingId(null)
    }
  }

  const syllabusPercent =
    data.syllabusSummary.totalChapters > 0
      ? Math.round(
          (data.syllabusSummary.completedChapters /
            data.syllabusSummary.totalChapters) *
            100
        )
      : 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 pb-6 sm:max-w-4xl md:max-w-none md:gap-5 md:pb-8 lg:max-w-6xl lg:gap-6 lg:pb-10">
      <CompactJourneyBar
        data={data}
        syllabusPercent={syllabusPercent}
        onRegenerate={regenerateGoals}
        regenerating={regenerating}
      />

      <div className="hidden items-end justify-between gap-4 md:flex">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            Your study journey
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each step is chosen for your syllabus, weak areas, and exam date.
          </p>
        </div>
        {data.activeGoals.length > 0 ? (
          <Badge
            variant="outline"
            className="shrink-0 border-[#E0E7FF] bg-[#F0F4FF] px-2.5 py-1 text-xs text-[#4169E1]"
          >
            {data.activeGoals.length} step
            {data.activeGoals.length === 1 ? "" : "s"}
          </Badge>
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-5 lg:gap-6">
        <section className="min-w-0 space-y-3 md:space-y-3">
          <div className="flex items-center justify-between gap-3 md:hidden">
            <div className="min-w-0">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Your study journey
              </h2>
            </div>
            {data.activeGoals.length > 0 ? (
              <Badge
                variant="outline"
                className="shrink-0 border-[#E0E7FF] bg-[#F0F4FF] text-[10px] text-[#4169E1]"
              >
                {data.activeGoals.length} step
                {data.activeGoals.length === 1 ? "" : "s"}
              </Badge>
            ) : null}
          </div>

          {data.activeGoals.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-[#E0E7FF] bg-[#FAFBFF] p-6 text-center lg:p-10">
              <MapPin
                className="mx-auto size-8 text-[#4169E1]/50 lg:size-9"
                aria-hidden
              />
              <p className="mt-3 text-sm font-medium text-foreground lg:mt-4">
                Your journey starts here
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground lg:text-sm">
                {data.examTarget
                  ? "Refresh to generate clear, subject-wise steps toward your exam."
                  : "Set your exam target, then refresh to map out your path."}
              </p>
            </Card>
          ) : (
            <div className="relative space-y-0">
              {data.activeGoals.map((goal, index) => (
                <JourneyStepCard
                  key={goal.id}
                  goal={goal}
                  stepNumber={index + 1}
                  isLast={index === data.activeGoals.length - 1}
                  showExamDestination={
                    index === data.activeGoals.length - 1 &&
                    Boolean(data.examTarget)
                  }
                  examTarget={data.examTarget}
                  daysUntilExam={data.daysUntilExam}
                  onDismiss={dismissGoal}
                  dismissing={dismissingId === goal.id}
                />
              ))}

              {!data.examTarget ? (
                <div className="flex gap-4 pt-1 md:gap-5 md:pt-2">
                  <div className="flex w-9 shrink-0 justify-center pt-1 md:w-10">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#E8EEFF] text-[#4169E1]">
                      <Flag className="size-3.5" aria-hidden />
                    </div>
                  </div>
                  <Card className="min-w-0 flex-1 rounded-xl border border-dashed border-[#E0E7FF] bg-[#FAFBFF] px-3 py-3 md:px-4 md:py-3.5">
                    <p className="text-sm font-semibold text-foreground">
                      Set your exam destination
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground lg:mt-1 lg:text-sm">
                      Add your exam in the panel to pace every step.
                    </p>
                  </Card>
                </div>
              ) : null}
            </div>
          )}

          {data.completedGoals.length > 0 ? (
            <section className="space-y-3 pt-1 md:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Steps you have completed
                </h2>
              </div>
              <div className="grid gap-2">
                {data.completedGoals.map((goal) => (
                  <CompletedStepCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="flex min-w-0 flex-col gap-3 md:sticky md:top-4 md:self-start">
          <div className="flex flex-col gap-3 md:rounded-2xl md:border md:border-[#E8EEFF] md:bg-white md:p-3 md:shadow-sm">
            <JourneySidebarPanel
              data={data}
              syllabusPercent={syllabusPercent}
              onRegenerate={regenerateGoals}
              regenerating={regenerating}
            />
            <ExamTargetCard
              examName={examName}
              examDate={examDate}
              savingExam={savingExam}
              examError={examError}
              data={data}
              syllabusPercent={syllabusPercent}
              onExamNameChange={setExamName}
              onExamDateChange={setExamDate}
              onSubmit={saveExamTarget}
            />
          </div>
          {data.completedGoals.length > 0 ? (
            <section className="hidden space-y-3 md:block">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Completed
                </h2>
              </div>
              <div className="space-y-2">
                {data.completedGoals.map((goal) => (
                  <CompletedStepCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

function CompactJourneyBar({
  data,
  syllabusPercent,
  onRegenerate,
  regenerating,
}: {
  data: GoalsPageData
  syllabusPercent: number
  onRegenerate: () => void
  regenerating: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4169E1] px-3.5 py-3 text-white shadow-sm md:hidden">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-wide text-blue-100 uppercase">
          Exam journey
        </p>
        <p className="truncate text-sm font-semibold">
          {data.examTarget?.examName ?? "Set your exam target"}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <Progress
            value={data.journey.overallPercent}
            className="h-1 flex-1 bg-white/20 [&>div]:bg-white"
          />
          <span className="shrink-0 text-[10px] font-semibold text-blue-100">
            {data.journey.overallPercent}%
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={onRegenerate}
          disabled={regenerating}
          className="size-8 border-0 bg-white/15 text-white hover:bg-white/25"
          aria-label="Refresh journey"
        >
          <RefreshCw
            className={cn("size-3.5", regenerating && "animate-spin")}
            aria-hidden
          />
        </Button>
        <p className="text-[10px] text-blue-100">
          {data.journey.activeSteps} steps · {syllabusPercent}% syllabus
        </p>
      </div>
    </div>
  )
}

function JourneySidebarPanel({
  data,
  syllabusPercent,
  onRegenerate,
  regenerating,
}: {
  data: GoalsPageData
  syllabusPercent: number
  onRegenerate: () => void
  regenerating: boolean
}) {
  return (
    <Card className="hidden overflow-hidden rounded-xl border-0 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#4169E1] p-0 text-white shadow-sm md:block">
      <div className="space-y-2.5 p-3.5 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-wide text-blue-100 uppercase">
              Exam journey
            </p>
            <p className="mt-0.5 font-heading text-sm leading-snug font-semibold md:text-base">
              {data.examTarget?.examName ?? "Set your exam target"}
            </p>
            {data.daysUntilExam !== null ? (
              <p className="mt-0.5 text-[11px] text-blue-100/90 md:text-xs">
                {data.daysUntilExam === 0
                  ? "Exam is today"
                  : `${data.daysUntilExam} day${data.daysUntilExam === 1 ? "" : "s"} remaining`}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={onRegenerate}
            disabled={regenerating}
            className="size-8 shrink-0 border-0 bg-white/15 text-white hover:bg-white/25"
            aria-label="Refresh journey"
          >
            <RefreshCw
              className={cn("size-3.5", regenerating && "animate-spin")}
              aria-hidden
            />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
          <SidebarStat
            label="Journey"
            value={`${data.journey.overallPercent}%`}
          />
          <SidebarStat label="Syllabus" value={`${syllabusPercent}%`} />
          <SidebarStat label="Steps" value={String(data.journey.activeSteps)} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-blue-100 md:text-[11px]">
            <span>Overall progress</span>
            <span>{data.journey.overallPercent}%</span>
          </div>
          <Progress
            value={data.journey.overallPercent}
            className="h-1.5 bg-white/20 [&>div]:bg-white"
          />
        </div>
      </div>
    </Card>
  )
}

function SidebarStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-2 py-2 text-center ring-1 ring-white/10">
      <p className="text-[8px] font-medium tracking-wide text-blue-100 uppercase md:text-[9px]">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold md:text-sm">{value}</p>
    </div>
  )
}

function ExamTargetCard({
  examName,
  examDate,
  savingExam,
  examError,
  data,
  syllabusPercent,
  onExamNameChange,
  onExamDateChange,
  onSubmit,
}: {
  examName: string
  examDate: string
  savingExam: boolean
  examError: string | null
  data: GoalsPageData
  syllabusPercent: number
  onExamNameChange: (value: string) => void
  onExamDateChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const examSummary = data.examTarget
    ? data.daysUntilExam === 0
      ? `${data.examTarget.examName} · Exam today`
      : `${data.examTarget.examName} · ${data.daysUntilExam} day${data.daysUntilExam === 1 ? "" : "s"} left`
    : "Tap to set your exam date"

  return (
    <Card className="overflow-hidden rounded-xl border border-[#E8EEFF] bg-white p-0 shadow-sm md:border-0 md:shadow-none">
      <button
        type="button"
        onClick={() => setMobileExpanded((open) => !open)}
        className="flex w-full items-center justify-between gap-3 border-b border-[#E8EEFF] bg-[#FAFBFF] px-3.5 py-3 text-left md:hidden"
        aria-expanded={mobileExpanded}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Calendar className="size-4 shrink-0 text-[#4169E1]" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Exam destination
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {examSummary}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            mobileExpanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <div className="hidden border-b border-[#E8EEFF] bg-[#FAFBFF] px-4 py-3 md:block md:rounded-t-xl">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-[#4169E1]" aria-hidden />
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Exam destination
          </h2>
        </div>
      </div>

      <div className={cn(!mobileExpanded && "hidden md:block")}>
        <form
          onSubmit={onSubmit}
          className="space-y-3 px-3.5 py-3.5 md:space-y-3 md:px-4 md:py-4"
        >
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 lg:gap-3">
            <Field>
              <FieldLabel htmlFor="exam-name">Exam name</FieldLabel>
              <Input
                id="exam-name"
                value={examName}
                onChange={(event) => onExamNameChange(event.target.value)}
                placeholder="e.g. Term 1 Finals"
                required
                minLength={2}
                maxLength={80}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="exam-date">Exam date</FieldLabel>
              <Input
                id="exam-date"
                type="date"
                value={examDate}
                onChange={(event) => onExamDateChange(event.target.value)}
                required
              />
            </Field>
          </div>

          {examError ? <FieldError>{examError}</FieldError> : null}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="submit"
              disabled={savingExam}
              size="sm"
              className="w-full bg-[#4169E1] hover:bg-[#3558C7] sm:w-auto"
            >
              {savingExam ? "Saving..." : "Update destination"}
            </Button>
            {data.examTarget && data.daysUntilExam !== null ? (
              <FieldHint className="hidden sm:inline">
                {data.daysUntilExam === 0
                  ? "Exam is today — focus on revision steps"
                  : `${data.daysUntilExam} day${data.daysUntilExam === 1 ? "" : "s"} until ${formatExamDate(data.examTarget.examDate)}`}
              </FieldHint>
            ) : (
              <FieldHint className="hidden sm:inline">
                Set your exam to unlock a timed journey.
              </FieldHint>
            )}
          </div>
        </form>

        <div className="border-t border-[#E8EEFF] bg-[#FAFBFF] px-3.5 py-3 md:px-4 md:py-3.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">Syllabus progress</span>
            <span className="font-semibold text-foreground">
              {data.syllabusSummary.completedChapters}/
              {data.syllabusSummary.totalChapters} ({syllabusPercent}%)
            </span>
          </div>
          <Progress value={syllabusPercent} className="mt-1.5 h-1.5" />
        </div>
      </div>
    </Card>
  )
}

function JourneyStepCard({
  goal,
  stepNumber,
  isLast,
  showExamDestination,
  examTarget,
  daysUntilExam,
  onDismiss,
  dismissing,
}: {
  goal: StudentGoal
  stepNumber: number
  isLast: boolean
  showExamDestination: boolean
  examTarget: GoalsPageData["examTarget"]
  daysUntilExam: number | null
  onDismiss: (goalId: string) => void
  dismissing: boolean
}) {
  const Icon = goalTypeIcon(goal.type)
  const percent = goalProgressPercent(goal)
  const instruction =
    goal.metadata?.instruction ??
    getGoalSubtitle(goal.metadata) ??
    goal.description
  const targets = goal.metadata?.targets ?? []

  return (
    <div className="flex items-stretch gap-5 pb-3.5 md:gap-6 md:pb-4">
      <div className="relative flex w-10 shrink-0 justify-center md:w-11">
        <div className="relative z-10 flex size-8 items-center justify-center rounded-full bg-[#4169E1] text-xs font-bold text-white shadow-[0_0_0_4px_#F0F4FF] md:size-9">
          {stepNumber}
        </div>
        {!isLast || showExamDestination ? (
          <div
            className="absolute top-9 bottom-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-[#4169E1]/40 to-[#C7D7FF]"
            aria-hidden
          />
        ) : null}
        {showExamDestination ? (
          <div className="absolute bottom-0 left-1/2 z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#F0F4FF] text-[#4169E1] ring-2 ring-[#4169E1]/20 md:hidden">
            <Flag className="size-3.5" aria-hidden />
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <Card className="overflow-hidden rounded-xl border border-[#E8EEFF] bg-white p-0 shadow-sm">
          <div className="flex">
            <div
              className={cn(
                "w-1 shrink-0",
                percent >= 100 ? "bg-emerald-500" : "bg-[#4169E1]"
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 p-3 md:p-3.5">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F4FF] text-[#4169E1] ring-1 ring-[#E0E7FF] md:size-9 md:rounded-xl">
                  <Icon
                    className="size-3.5 md:size-4"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge
                      variant="outline"
                      className="border-[#E0E7FF] bg-[#FAFBFF] px-1.5 py-0 text-[9px] font-semibold tracking-wide text-[#6B85E8] uppercase"
                    >
                      {getGoalActionLabel(goal.type)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-[#E0E7FF] px-1.5 py-0 text-[9px] text-muted-foreground"
                    >
                      Due {formatPeriodEnd(goal.periodEnd)}
                    </Badge>
                    {goal.source === "AI" ? (
                      <Badge
                        variant="outline"
                        className="hidden border-violet-100 bg-violet-50 px-1.5 py-0 text-[9px] text-violet-700 sm:inline-flex"
                      >
                        Personalized
                      </Badge>
                    ) : null}
                  </div>

                  <h3 className="mt-1 line-clamp-2 font-heading text-sm leading-snug font-semibold text-foreground">
                    {goal.title}
                  </h3>

                  {targets.length > 0 ? (
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground md:text-xs">
                      {targets
                        .map(
                          (target) =>
                            `${target.chapterTitle} · ${target.subjectTitle}`
                        )
                        .join(" · ")}
                    </p>
                  ) : null}

                  {instruction ? (
                    <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-muted-foreground md:hidden">
                      {instruction}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDismiss(goal.id)}
                  disabled={dismissing}
                  className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss step"
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </div>

              <div className="mt-2.5 flex items-center gap-3 md:mt-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-[#4169E1]">
                      {goal.progressCount}/{goal.targetCount} ({percent}%)
                    </span>
                  </div>
                  <Progress value={percent} className="h-1.5" />
                </div>

                {goal.href ? (
                  <Link
                    href={goal.href}
                    className="inline-flex w-[6.75rem] shrink-0 items-center justify-center gap-1 rounded-lg bg-[#F0F4FF] px-2.5 py-1.5 text-[11px] font-semibold text-[#4169E1] transition-colors hover:bg-[#E8EEFF] md:w-[7.25rem] md:py-2 md:text-xs"
                  >
                    Continue
                    <ArrowRight className="size-3" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        {showExamDestination && examTarget ? (
          <div className="mt-2.5 md:hidden">
            <Card className="rounded-xl border border-[#4169E1]/20 bg-gradient-to-br from-[#F8FAFF] to-white px-3 py-3">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[#6B85E8] uppercase">
                Destination
              </p>
              <p className="mt-0.5 font-heading text-sm font-semibold text-foreground">
                {examTarget.examName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {daysUntilExam === 0
                  ? "Exam day"
                  : `${daysUntilExam} day${daysUntilExam === 1 ? "" : "s"} away · ${formatExamDate(examTarget.examDate)}`}
              </p>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CompletedStepCard({ goal }: { goal: StudentGoal }) {
  const targets = goal.metadata?.targets ?? []

  return (
    <Card className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
      <div className="flex items-start gap-3">
        <CheckCircle2
          className="mt-0.5 size-4 shrink-0 text-emerald-600"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{goal.title}</p>
          {targets.length > 0 ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {targets
                .map(
                  (target) => `${target.chapterTitle} · ${target.subjectTitle}`
                )
                .join(" · ")}
            </p>
          ) : null}
          {goal.completedAt ? (
            <p className="mt-1 text-xs text-emerald-700">
              Completed {formatPeriodEnd(goal.completedAt)}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
