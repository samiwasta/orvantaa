"use client"

import { Card, CardDescription, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import {
  BookOpen,
  Bot,
  CalendarCheck2,
  Clock3,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import type { PerformanceScorecard } from "../model/performance-score"

const statIcons = {
  accuracy: Target,
  attendance: CalendarCheck2,
  streak: Flame,
  syllabus: BookOpen,
  ai: Bot,
  time: Clock3,
} as const

const radarShortLabels: Record<string, string> = {
  accuracy: "Accuracy",
  attendance: "Attend.",
  streak: "Streak",
  syllabus: "Syllabus",
  learningDepth: "Depth",
  aiEngagement: "AI",
}

function ScoreRing({ score }: { score: number | null }) {
  const display = score ?? 0
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (display / 100) * circumference

  return (
    <div className="relative flex size-[132px] items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className="text-muted/35"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={score === null ? circumference : offset}
          className="text-[#4169E1] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-heading text-[2rem] leading-none font-semibold tracking-tight text-foreground">
          {score === null ? "—" : score}
        </p>
        <p className="mt-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Overall
        </p>
      </div>
    </div>
  )
}

export function PerformanceOverallCard({
  scorecard,
}: {
  scorecard: PerformanceScorecard
}) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5">
      <div className="border-b border-border/50 px-5 py-4">
        <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground">
          Performance score
        </CardTitle>
        <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          Your overall learning score
        </CardDescription>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-6">
        <ScoreRing score={scorecard.overallScore} />
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F4FF] px-3 py-1 text-xs font-semibold text-[#4169E1] ring-1 ring-[#E0E7FF]">
            <TrendingUp className="size-3.5" strokeWidth={2.5} />
            {scorecard.gradePaceLabel}
          </span>
          {scorecard.integrityPenalty > 0 ? (
            <p className="mt-2 text-xs text-rose-600">
              Integrity adjustment −{scorecard.integrityPenalty}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export function PerformanceFactorsCard({
  scorecard,
}: {
  scorecard: PerformanceScorecard
}) {
  const radarData = scorecard.factors.map((factor) => ({
    factor: radarShortLabels[factor.key] ?? factor.label,
    value: factor.value ?? 0,
    fullMark: 100,
  }))

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5">
      <div className="border-b border-border/50 px-5 py-4">
        <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground">
          Score factors
        </CardTitle>
        <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          How accuracy, attendance, streak, syllabus, depth, and AI shape your
          score
        </CardDescription>
      </div>

      <div className="grid flex-1 gap-4 px-5 py-5 lg:grid-cols-2 lg:items-center">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="factor"
                tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Score"]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#4169E1"
                fill="#4169E1"
                fillOpacity={0.22}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {scorecard.factors.map((factor) => (
            <div key={factor.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {factor.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {factor.description}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    factor.value === null
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  {factor.value === null ? "—" : `${factor.value}%`}
                </p>
              </div>
              <Progress
                value={factor.value ?? 0}
                className="h-1.5 **:data-[slot=progress-indicator]:bg-[#4169E1]"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function PerformanceMetricTiles({
  scorecard,
}: {
  scorecard: PerformanceScorecard
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {scorecard.stats.map((stat) => {
        const Icon = statIcons[stat.key as keyof typeof statIcons] ?? Target
        return (
          <Card
            key={stat.key}
            className="gap-0 rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5"
          >
            <div className="flex h-full flex-col justify-between gap-3 px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F4FF] text-[#4169E1]">
                  <Icon className="size-3.5" strokeWidth={2.25} />
                </div>
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
              <div>
                <p className="font-heading text-xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                {stat.hint ? (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {stat.hint}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
