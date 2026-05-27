"use client"

import { cn } from "@workspace/ui/lib/utils"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { GenderBreakdown, SignupDataPoint } from "../model/admin-dashboard-stats"

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-black/[0.04]",
        className
      )}
    >
      <div className="border-b border-border/50 px-5 py-4">
        <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
    </div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function SignupTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        <span className="font-semibold text-[#6C5CE7]">{payload[0]?.value ?? 0}</span>{" "}
        new students
      </p>
    </div>
  )
}

function GenderTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        <span className="font-semibold" style={{ color: label === "Male" ? "#3b82f6" : "#ec4899" }}>
          {payload[0]?.value ?? 0}
        </span>{" "}
        students
      </p>
    </div>
  )
}

// ─── Signups area chart ───────────────────────────────────────────────────────

export function SignupsChart({ data }: { data: SignupDataPoint[] }) {
  const totalInPeriod = data.reduce((sum, d) => sum + d.students, 0)

  return (
    <ChartCard
      title="Student signups"
      description={`Last 14 days · ${totalInPeriod} total new students`}
      className="flex flex-col lg:col-span-2"
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<SignupTooltip />} cursor={{ stroke: "#6C5CE7", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="students"
            stroke="#6C5CE7"
            strokeWidth={2.5}
            fill="url(#signupGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#6C5CE7", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Gender bar chart ─────────────────────────────────────────────────────────

export function GenderChart({ data }: { data: GenderBreakdown }) {
  const total = data.male + data.female
  const malePercent = total > 0 ? Math.round((data.male / total) * 100) : 0
  const femalePercent = total > 0 ? Math.round((data.female / total) * 100) : 0

  const chartData = [
    { name: "Male", value: data.male, color: "#3b82f6" },
    { name: "Female", value: data.female, color: "#ec4899" },
  ]

  return (
    <ChartCard
      title="Gender breakdown"
      description={`${total} total students`}
    >
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#3b82f6]" />
          <span className="text-xs text-muted-foreground">Male {malePercent}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ec4899]" />
          <span className="text-xs text-muted-foreground">Female {femalePercent}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={185}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          barSize={40}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<GenderTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#3b82f6]/8 px-3 py-2.5 text-center">
          <p className="font-heading text-xl font-bold text-[#3b82f6]">{data.male}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Male</p>
        </div>
        <div className="rounded-xl bg-[#ec4899]/8 px-3 py-2.5 text-center">
          <p className="font-heading text-xl font-bold text-[#ec4899]">{data.female}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Female</p>
        </div>
      </div>
    </ChartCard>
  )
}
