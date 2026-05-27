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
  performanceInsights,
  subjectAccuracy,
  subjectBarColors,
  weeklyAccuracyDeltaPercent,
  weeklyAccuracyTrend,
} from "../model/performance-data"
import { ReportCardUploadCard } from "./report-card-upload-card"

// ─── Card wrapper ─────────────────────────────────────────────────────────────
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
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-[17px]">
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

// ─── Shared tooltip styles ────────────────────────────────────────────────────
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

// ─── Line chart ───────────────────────────────────────────────────────────────
function LineTooltip({
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
      <span style={{ color: "#6b7280", fontWeight: 400 }}>{label} — </span>
      Accuracy: {payload[0]?.value}%
    </div>
  )
}

function PerformanceOverTimeChart() {
  return (
    <div className="h-[280px] w-full px-3 pt-4 pb-4 sm:h-[320px] sm:px-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={weeklyAccuracyTrend}
          margin={{ top: 12, right: 12, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient
              id="rechartsLineAreaGrad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0.01} />
            </linearGradient>
          </defs>
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
            dy={8}
          />
          <YAxis
            domain={[35, 100]}
            ticks={[35, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#b0b7c3", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            width={42}
          />
          <Tooltip
            content={<LineTooltip />}
            cursor={{
              stroke: "#6C5CE7",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6C5CE7"
            strokeWidth={2.5}
            fill="url(#rechartsLineAreaGrad)"
            dot={{ fill: "#6C5CE7", stroke: "#fff", strokeWidth: 2, r: 4 }}
            activeDot={{
              fill: "#6C5CE7",
              stroke: "#fff",
              strokeWidth: 2.5,
              r: 5.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Bar value label ─────────────────────────────────────────────────────────
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

// ─── Bar chart ────────────────────────────────────────────────────────────────
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
      {label}: <span style={{ color: "#6C5CE7" }}>{payload[0]?.value}%</span>
    </div>
  )
}

function SubjectBarChart() {
  return (
    <div className="h-[280px] w-full px-3 pt-4 pb-4 sm:h-[320px] sm:px-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={subjectAccuracy}
          margin={{ top: 24, right: 12, bottom: 8, left: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            vertical={false}
            stroke="#e9eaec"
            strokeDasharray="5 5"
          />
          <XAxis
            dataKey="subject"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9ca3af", fontSize: 10.5, fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            domain={[0, 110]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#b0b7c3", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            width={42}
          />
          <ReferenceLine y={100} stroke="#e9eaec" strokeDasharray="5 5" />
          <Tooltip
            content={<BarTooltip />}
            cursor={{ fill: "rgba(108,92,231,0.06)", radius: 6 }}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={52}
            label={<BarValueLabel />}
          >
            {subjectAccuracy.map((item) => (
              <Cell
                key={item.subject}
                fill={subjectBarColors[item.tier]}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Insights card ────────────────────────────────────────────────────────────
function PerformanceInsightsCard() {
  const { strength, needsImprovement, tip, focusChapters } = performanceInsights

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5">
      <div className="border-b border-border/50 px-5 py-4 sm:px-6">
        <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-[17px]">
          Performance Insights
        </CardTitle>
        <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          Your strengths and areas that need attention
        </CardDescription>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 py-4 sm:px-6 sm:py-5">
        {/* Strength & Needs Improvement — always side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3.5 ring-1 ring-emerald-100/80">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <TrendingUp className="size-[16px]" strokeWidth={2.25} />
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

          <div className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3.5 ring-1 ring-violet-100/80">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7] text-white shadow-sm">
              <Target className="size-[16px]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-[#6C5CE7]/80 uppercase">
                {needsImprovement.label}
              </p>
              <p className="truncate font-heading text-base leading-tight font-semibold text-foreground sm:text-[17px]">
                {needsImprovement.subject}
              </p>
            </div>
          </div>
        </div>

        {/* Tip — full width */}
        <div className="flex gap-3 rounded-xl bg-amber-50/70 px-4 py-3.5 ring-1 ring-amber-100/80">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-500">
            <Lightbulb className="size-[15px]" strokeWidth={2} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{tip}</p>
        </div>

        {/* Chapters to focus on — flex-1 so it fills remaining space */}
        <div className="flex flex-1 flex-col">
          <p className="mb-2.5 text-sm font-semibold text-foreground">
            Chapters to focus on
          </p>
          <ul className="flex flex-col gap-2">
            {focusChapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={chapter.href}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border border-[#FF8A3D]/30 bg-muted/30 px-4 py-3 text-sm font-medium text-foreground transition-colors",
                    "hover:border-[#FF8A3D]/55 hover:bg-orange-50/60"
                  )}
                >
                  {chapter.label}
                  <ChevronRight className="size-4 shrink-0 text-[#FF8A3D]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}

// ─── Bento grid ───────────────────────────────────────────────────────────────
export function PerformanceBentoGrid() {
  return (
    <section className="@container/perf flex flex-col gap-4 sm:gap-5">
      <div className="grid grid-cols-1 gap-4 @[900px]/perf:grid-cols-5 @[900px]/perf:items-stretch @[900px]/perf:gap-5">
        <ChartMetricCard
          className="@[900px]/perf:col-span-3"
          title="Performance over time"
          description="See how your accuracy has improved"
          badge={
            <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 sm:text-xs">
              +{weeklyAccuracyDeltaPercent}% this week
            </span>
          }
        >
          <PerformanceOverTimeChart />
        </ChartMetricCard>

        <ChartMetricCard
          className="@[900px]/perf:col-span-2"
          title="Subject-wise Performance"
          description="Compare your accuracy across subjects"
        >
          <SubjectBarChart />
        </ChartMetricCard>
      </div>

      <div className="grid grid-cols-1 gap-4 @[900px]/perf:grid-cols-5 @[900px]/perf:items-stretch @[900px]/perf:gap-5">
        <div className="@[900px]/perf:col-span-3">
          <PerformanceInsightsCard />
        </div>
        <div className="@[900px]/perf:col-span-2">
          <ReportCardUploadCard />
        </div>
      </div>
    </section>
  )
}
