"use client"

import { Card, CardDescription, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronRight, Lightbulb, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  subjectBarColors,
  type WeeklyAccuracyPoint,
} from "../model/performance-data"
import type { DailyPerformancePoint } from "../model/performance-score"
import type { PerformanceDashboardData } from "../repository/performance.repository"
import {
  PerformanceFactorsCard,
  PerformanceMetricTiles,
  PerformanceOverallCard,
} from "./performance-scorecard"
import { ReportCardUploadCard } from "./report-card-upload-card"

type ChartMetricCardProps = {
  title: string
  description: string
  badge?: ReactNode
  children: ReactNode
  className?: string
}

function ChartMetricCard({
  title,
  description,
  badge,
  children,
  className,
}: ChartMetricCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-5 py-4">
        <div className="min-w-0">
          <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {description}
          </CardDescription>
        </div>
        {badge}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </Card>
  )
}

const tooltipWrapperStyle: React.CSSProperties = {
  outline: "none",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  backgroundColor: "#fff",
  boxShadow: "0 4px 16px -4px rgba(0,0,0,0.12)",
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
  color: "#111827",
  pointerEvents: "none",
}

function LineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{
    value?: number
    dataKey?: string | number
    color?: string
    name?: string
  }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipWrapperStyle}>
      <div style={{ color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} style={{ color: entry.color }}>
          {entry.name}: {entry.value ?? "—"}
          {entry.value != null ? "%" : ""}
        </div>
      ))}
    </div>
  )
}

function formatTrendLabel(point: DailyPerformancePoint) {
  const [, month, day] = point.dateKey.split("-")
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ] as const
  const monthIndex = Number(month) - 1
  const monthLabel = monthNames[monthIndex] ?? month
  return `${Number(day)} ${monthLabel}`
}

function PerformanceOverTimeChart({
  data,
  hasActivity,
}: {
  data: DailyPerformancePoint[]
  hasActivity: boolean
}) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatTrendLabel(point),
  }))
  const values = chartData
    .map((point) => point.value)
    .filter((value): value is number => value !== null)
  const minValue = values.length > 0 ? Math.max(0, Math.min(...values) - 10) : 0
  const yTicks = Array.from(
    new Set(
      [minValue, 50, 75, 100].filter((tick) => tick >= minValue && tick <= 100)
    )
  ).sort((a, b) => a - b)

  if (!hasActivity) {
    return (
      <div className="flex h-[240px] items-center justify-center px-5 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Complete quizzes, lessons, or AI tutor sessions to start tracking your
          performance over time.
        </p>
      </div>
    )
  }

  return (
    <div className="h-[240px] w-full overflow-x-auto px-3 pt-3 pb-3 sm:px-4">
      <div className="h-full min-w-[560px] sm:min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 4, left: 0 }}
          >
            <defs>
              <linearGradient
                id="rechartsLineAreaGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#4169E1" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#4169E1" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#e9eaec"
              strokeDasharray="5 5"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={36}
              tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              domain={[minValue, 100]}
              ticks={yTicks}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#b0b7c3", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip
              content={<LineTooltip />}
              cursor={{
                stroke: "#4169E1",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              name="Performance"
              dataKey="value"
              stroke="#4169E1"
              strokeWidth={2.5}
              fill="url(#rechartsLineAreaGrad)"
              connectNulls
              dot={false}
              activeDot={{
                fill: "#4169E1",
                stroke: "#fff",
                strokeWidth: 2.5,
                r: 5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function WeeklySnapshotChart({
  data,
  hasActivity,
}: {
  data: WeeklyAccuracyPoint[]
  hasActivity: boolean
}) {
  if (!hasActivity) {
    return (
      <div className="flex h-[240px] items-center justify-center px-5 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your weekly snapshot appears after you start learning.
        </p>
      </div>
    )
  }

  return (
    <div className="h-[240px] w-full px-3 pt-3 pb-3 sm:px-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#e9eaec"
            strokeDasharray="5 5"
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#b0b7c3", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            width={36}
          />
          <Tooltip content={<LineTooltip />} />
          <Area
            type="monotone"
            name="This week"
            dataKey="value"
            stroke="#FF8A3D"
            strokeWidth={2}
            fill="#FF8A3D"
            fillOpacity={0.12}
            connectNulls
            dot={{ fill: "#FF8A3D", stroke: "#fff", strokeWidth: 2, r: 3.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarValueLabel(props: {
  x?: number
  y?: number
  width?: number
  value?: number
}) {
  const { x = 0, y = 0, width = 0, value } = props
  if (value === undefined) return null
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fill="#4b5563"
      fontSize={10}
      fontWeight={600}
    >
      {value}%
    </text>
  )
}

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value?: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipWrapperStyle}>
      {label}: <span style={{ color: "#4169E1" }}>{payload[0]?.value}%</span>
    </div>
  )
}

function truncateSubjectLabel(label: string, maxLength = 12) {
  if (label.length <= maxLength) return label
  return `${label.slice(0, maxLength - 1)}…`
}

function SubjectBarChart({
  data,
}: {
  data: PerformanceDashboardData["subjectAccuracy"]
}) {
  const subjectCount = data.length

  if (subjectCount === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center px-5 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your class subjects will appear here once assigned by your school.
        </p>
      </div>
    )
  }

  const useCompactLayout = subjectCount > 6
  const useScroll = subjectCount > 6
  const chartMinWidth = Math.max(
    320,
    subjectCount * (useCompactLayout ? 52 : 72)
  )
  const barSize =
    subjectCount > 10 ? 28 : subjectCount > 8 ? 32 : subjectCount > 5 ? 40 : 52
  const tickFontSize = subjectCount > 10 ? 8.5 : subjectCount > 8 ? 9 : 10.5

  return (
    <div
      className={cn(
        "h-[240px] w-full px-3 pt-3 pb-3 sm:px-4",
        useScroll && "overflow-x-auto"
      )}
    >
      <div
        className="h-full"
        style={{ minWidth: useScroll ? chartMinWidth : "100%" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 8,
              bottom: useCompactLayout ? 24 : 4,
              left: 0,
            }}
            barCategoryGap={subjectCount > 8 ? "10%" : "18%"}
          >
            <CartesianGrid
              vertical={false}
              stroke="#e9eaec"
              strokeDasharray="5 5"
            />
            <XAxis
              dataKey="subject"
              interval={0}
              tickLine={false}
              axisLine={false}
              angle={useCompactLayout ? -35 : 0}
              textAnchor={useCompactLayout ? "end" : "middle"}
              height={useCompactLayout ? 48 : 28}
              tick={{
                fill: "#9ca3af",
                fontSize: tickFontSize,
                fontWeight: 500,
              }}
              tickFormatter={(value: string) =>
                truncateSubjectLabel(value, useCompactLayout ? 10 : 14)
              }
              dy={4}
            />
            <YAxis
              domain={[0, 110]}
              ticks={[0, 50, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#b0b7c3", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <ReferenceLine y={100} stroke="#e9eaec" strokeDasharray="5 5" />
            <Tooltip
              content={<BarTooltip />}
              cursor={{ fill: "rgba(65,105,225,0.06)", radius: 6 }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              maxBarSize={barSize}
              label={subjectCount <= 8 ? <BarValueLabel /> : undefined}
            >
              {data.map((item) => (
                <Cell
                  key={item.subjectId}
                  fill={subjectBarColors[item.tier]}
                  fillOpacity={item.value > 0 ? 0.9 : 0.35}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PerformanceInsightsCard({
  insights,
}: {
  insights: PerformanceDashboardData["performanceInsights"]
}) {
  const { strength, needsImprovement, tip, focusChapters } = insights

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5">
      <div className="border-b border-border/50 px-5 py-4">
        <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground">
          Performance Insights
        </CardTitle>
        <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          Strengths and areas that need attention
        </CardDescription>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3.5 py-3 ring-1 ring-emerald-100/80">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <TrendingUp className="size-4" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-emerald-700/80 uppercase">
                {strength.label}
              </p>
              <p className="truncate font-heading text-sm font-semibold text-foreground sm:text-base">
                {strength.subject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[#F0F4FF] px-3.5 py-3 ring-1 ring-[#E0E7FF]/80">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#4169E1] text-white shadow-sm">
              <Target className="size-4" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-[#4169E1]/80 uppercase">
                {needsImprovement.label}
              </p>
              <p className="truncate font-heading text-sm font-semibold text-foreground sm:text-base">
                {needsImprovement.subject}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl bg-amber-50/70 px-3.5 py-3 ring-1 ring-amber-100/80">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-500">
            <Lightbulb className="size-3.5" strokeWidth={2} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{tip}</p>
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold text-foreground">
            Chapters to focus on
          </p>
          {focusChapters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 px-3.5 py-3 text-sm text-muted-foreground">
              Complete more quizzes to see chapters that need attention.
            </div>
          ) : (
            <ul
              className={cn(
                "flex flex-col gap-2",
                focusChapters.length > 3 &&
                  "max-h-[188px] overflow-y-auto overscroll-contain pr-1"
              )}
            >
              {focusChapters.map((chapter) => (
                <li key={chapter.id} className="shrink-0">
                  <Link
                    href={chapter.href}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl border border-[#FF8A3D]/30 bg-muted/30 px-3.5 py-3 text-sm font-medium text-foreground transition-colors",
                      "hover:border-[#FF8A3D]/55 hover:bg-orange-50/60"
                    )}
                  >
                    <span className="min-w-0 truncate">{chapter.label}</span>
                    <ChevronRight className="size-4 shrink-0 text-[#FF8A3D]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  )
}

export function PerformanceBentoGrid({
  dashboard,
}: {
  dashboard: PerformanceDashboardData
}) {
  const delta = dashboard.weeklyAccuracyDeltaPercent
  const deltaLabel =
    delta === 0 ? null : `${delta > 0 ? "+" : ""}${delta}% this week`

  return (
    <section className="@container/perf flex flex-col gap-5 sm:gap-6">
      <div className="grid grid-cols-1 gap-5 sm:gap-6 @[960px]/perf:grid-cols-3 @[960px]/perf:items-stretch">
        <div className="@[960px]/perf:col-span-1">
          <PerformanceOverallCard scorecard={dashboard.scorecard} />
        </div>
        <div className="@[960px]/perf:col-span-2">
          <PerformanceFactorsCard scorecard={dashboard.scorecard} />
        </div>
      </div>

      <PerformanceMetricTiles scorecard={dashboard.scorecard} />

      <div className="grid grid-cols-1 gap-5 sm:gap-6 @[960px]/perf:grid-cols-5 @[960px]/perf:items-stretch">
        <ChartMetricCard
          className="@[960px]/perf:col-span-3"
          title="Performance over time"
          description="28-day score from quizzes, notes, and Orvantaa AI"
          badge={
            deltaLabel ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 sm:text-xs",
                  delta > 0
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-rose-200"
                )}
              >
                {deltaLabel}
              </span>
            ) : null
          }
        >
          <PerformanceOverTimeChart
            data={dashboard.dailyPerformanceTrend}
            hasActivity={dashboard.hasActivity}
          />
        </ChartMetricCard>

        <ChartMetricCard
          className="@[960px]/perf:col-span-2"
          title="This week"
          description="Daily composite for the current week"
        >
          <WeeklySnapshotChart
            data={dashboard.weeklyAccuracyTrend}
            hasActivity={dashboard.hasActivity}
          />
        </ChartMetricCard>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 @[960px]/perf:grid-cols-5 @[960px]/perf:items-stretch">
        <ChartMetricCard
          className="@[960px]/perf:col-span-3"
          title="Subject-wise Performance"
          description="Compare your accuracy across subjects"
        >
          <SubjectBarChart data={dashboard.subjectAccuracy} />
        </ChartMetricCard>

        <div className="@[960px]/perf:col-span-2">
          <PerformanceInsightsCard insights={dashboard.performanceInsights} />
        </div>
      </div>

      <ReportCardUploadCard initialReport={dashboard.reportCard} />
    </section>
  )
}
