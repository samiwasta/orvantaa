import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  ClipboardCheck,
  Clock3,
  Flame,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import type {
  ActiveLearnerDashboardData,
  DashboardActionCard,
  DashboardPerformanceInsights,
  PerformanceSummaryStat,
} from "../model/active-learner-dashboard-data"
import { AiTutorPromptCard } from "./ai-tutor-prompt-card"

const actionButtonStyle =
  "h-9 w-[8rem] justify-center rounded-lg bg-[#ff9b45] px-4 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(255,155,69,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#f58d36] sm:h-10 sm:w-[8.75rem]"

const actionCardStyles: Record<
  DashboardActionCard["variant"],
  {
    card: string
    badge: string
    title: string
    glow?: string
  }
> = {
  purple: {
    card: "bg-linear-to-br from-[#7f54ee] via-[#7550ea] to-[#6447dd] text-white shadow-[0_20px_44px_-24px_rgba(108,92,231,0.95)]",
    badge: "bg-white/95 text-foreground/70",
    title: "text-white",
    glow: "bg-white/10",
  },
  white: {
    card: "bg-white text-foreground shadow-md ring-1 ring-black/5",
    badge: "bg-foreground text-background",
    title: "text-foreground",
  },
  blue: {
    card: "bg-linear-to-br from-[#178fc8] via-[#139fbd] to-[#10a8b7] text-white shadow-[0_20px_44px_-24px_rgba(17,166,184,0.95)]",
    badge: "bg-white/95 text-foreground/70",
    title: "text-white",
    glow: "bg-white/10",
  },
}

const statToneStyles: Record<
  PerformanceSummaryStat["tone"],
  { card: string; icon: string; value: string }
> = {
  purple: {
    card: "bg-violet-50/90 ring-violet-100",
    icon: "text-[#6C5CE7]",
    value: "text-[#6C5CE7]",
  },
  orange: {
    card: "bg-orange-50/90 ring-orange-100",
    icon: "text-[#FF8A3D]",
    value: "text-[#FF8A3D]",
  },
  amber: {
    card: "bg-amber-50/90 ring-amber-100",
    icon: "text-amber-500",
    value: "text-amber-600",
  },
  teal: {
    card: "bg-cyan-50/90 ring-cyan-100",
    icon: "text-cyan-600",
    value: "text-cyan-700",
  },
}

const statIcons: Record<PerformanceSummaryStat["tone"], LucideIcon> = {
  purple: Target,
  orange: ClipboardCheck,
  amber: Flame,
  teal: Clock3,
}

type ActiveLearnerBentoGridProps = {
  data: ActiveLearnerDashboardData
}

export function ActiveLearnerBentoGrid({ data }: ActiveLearnerBentoGridProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch">
        <CurrentLessonCard lesson={data.currentLesson} />
        <PerformanceSummaryCard performance={data.performance} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {data.actionCards.map((card) => (
          <DashboardActionCard key={card.title} card={card} />
        ))}
      </div>

      <Separator className="mt-2 bg-border/60 sm:mt-3" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-stretch">
        <PerformanceInsightsCard insights={data.performanceInsights} />
        <AiTutorPromptCard
          title="Ask your AI Tutor"
          description="Get help with concepts, clear your doubts, or generate practice questions instantly with AI support"
          placeholder="Ask anything about your studies..."
        />
      </div>
    </section>
  )
}

function CurrentLessonCard({
  lesson,
}: {
  lesson: ActiveLearnerDashboardData["currentLesson"]
}) {
  const progressLabel =
    lesson.totalLessons > 0
      ? `${lesson.completedLessons}/${lesson.totalLessons} lessons`
      : "No lessons yet"

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-md ring-1 ring-black/5 xl:col-span-1">
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="inline-flex w-fit rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
          {lesson.subjectTitle}
        </span>

        <h3 className="mt-4 font-heading text-xl leading-snug font-semibold tracking-tight text-foreground sm:text-[1.35rem]">
          {lesson.chapterLabel}
        </h3>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">Progress</span>
            <span className="text-muted-foreground">{progressLabel}</span>
          </div>
          <Progress
            value={lesson.progressPercent}
            className="h-2.5 bg-violet-100/80 **:data-[slot=progress-indicator]:bg-[#6C5CE7]"
          />
        </div>

        <div className="mt-auto flex justify-end pt-8">
          <Button
            asChild
            className="h-10 rounded-xl bg-[#FF8A3D] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(255,138,61,0.95)] hover:bg-[#f57f31]"
          >
            <Link href={lesson.continueHref}>Continue</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

function PerformanceSummaryCard({
  performance,
}: {
  performance: ActiveLearnerDashboardData["performance"]
}) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-sky-100/80 bg-white py-0 shadow-md ring-1 ring-black/5 xl:col-span-2">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/40 px-5 py-4 sm:px-6">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Performance
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <TrendingUp className="size-3.5" strokeWidth={2.5} />
          {performance.gradePaceLabel}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:p-5">
        {performance.stats.map((stat) => (
          <PerformanceStatTile key={stat.label} stat={stat} />
        ))}
      </div>
    </Card>
  )
}

function PerformanceStatTile({ stat }: { stat: PerformanceSummaryStat }) {
  const styles = statToneStyles[stat.tone]
  const Icon = statIcons[stat.tone]

  return (
    <div
      className={cn(
        "flex h-full min-h-[112px] flex-col justify-between rounded-2xl p-4 ring-1",
        styles.card
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn("size-4 shrink-0", styles.icon)}
          strokeWidth={2.25}
        />
        <span className="text-sm font-medium text-foreground/80">
          {stat.label}
        </span>
      </div>
      <p
        className={cn(
          "text-[1.75rem] font-semibold tracking-tight sm:text-3xl",
          styles.value
        )}
      >
        {stat.value}
      </p>
    </div>
  )
}

function PerformanceInsightsCard({
  insights,
}: {
  insights: DashboardPerformanceInsights
}) {
  const { strength, growthArea, tip } = insights

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-md ring-1 ring-black/5">
      <div className="px-5 py-4 sm:px-6">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Performance Insights
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/90 px-4 py-4 ring-1 ring-emerald-100">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <TrendingUp className="size-[18px]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-emerald-700/80 uppercase">
                {strength.label}
              </p>
              <p className="truncate font-heading text-base leading-tight font-semibold text-foreground sm:text-[17px]">
                {strength.subject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-violet-50/90 px-4 py-4 ring-1 ring-violet-100">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7] text-white shadow-sm">
              <Target className="size-[18px]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-[#6C5CE7]/80 uppercase">
                {growthArea.label}
              </p>
              <p className="truncate font-heading text-base leading-tight font-semibold text-foreground sm:text-[17px]">
                {growthArea.subject}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-2.5 pt-1">
          <Lightbulb
            className="mt-0.5 size-4 shrink-0 text-amber-500"
            strokeWidth={2}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">{tip}</p>
        </div>
      </div>
    </Card>
  )
}

function DashboardActionCard({ card }: { card: DashboardActionCard }) {
  const styles = actionCardStyles[card.variant]

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border-0 p-0 ring-0",
        styles.card
      )}
    >
      {styles.glow ? (
        <>
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 -left-10 size-44 -translate-y-1/2 rounded-full blur-3xl",
              styles.glow
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute -top-8 -right-8 size-44 rounded-full blur-3xl",
              styles.glow
            )}
          />
        </>
      ) : null}

      <div className="relative flex h-full min-h-[200px] flex-col justify-between p-5 sm:p-6">
        {/* Top: badge + title */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex max-w-full truncate rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                styles.badge
              )}
            >
              {card.badge}
            </span>

            <h3
              className={cn(
                "mt-3 line-clamp-2 font-heading text-xl leading-snug font-semibold tracking-tight",
                styles.title
              )}
            >
              {card.title}
            </h3>
          </div>

          <div className="shrink-0">
            <Image
              src={card.imageSrc}
              alt={card.imageAlt}
              width={128}
              height={128}
              className="size-[100px] object-contain sm:size-[120px]"
            />
          </div>
        </div>

        {/* Bottom: button */}
        <div className="mt-6">
          <Button asChild className={actionButtonStyle}>
            <Link href={card.href}>{card.buttonLabel}</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
