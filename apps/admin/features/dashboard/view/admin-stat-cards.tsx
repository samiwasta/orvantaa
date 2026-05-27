import { cn } from "@workspace/ui/lib/utils"
import {
  BookOpen,
  GraduationCap,
  Landmark,
  School,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import type { DashboardCounts } from "../model/admin-dashboard-stats"

type StatCardProps = {
  label: string
  value: number | string
  sub?: string
  icon: LucideIcon
  color: string
  href?: string
  highlight?: boolean
}

function StatCard({ label, value, sub, icon: Icon, color, href, highlight }: StatCardProps) {
  const inner = (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.04] transition-all",
        href && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        highlight && "border-[#6C5CE7]/20 bg-gradient-to-br from-white to-[#6C5CE7]/[0.03]"
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="size-4.5" style={{ color }} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {sub ? (
          <p className="mb-0.5 text-xs text-muted-foreground">{sub}</p>
        ) : null}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}

type Props = { counts: DashboardCounts }

export function AdminStatCards({ counts }: Props) {
  const {
    totalStudents,
    totalSchools,
    totalClasses,
    totalSubjects,
    totalChapters,
    totalBoards,
    unassignedStudents,
    signupsThisWeek,
    signupsPriorWeek,
  } = counts

  const assignedStudents = totalStudents - unassignedStudents
  const weekDelta = signupsThisWeek - signupsPriorWeek
  const weekDeltaLabel =
    weekDelta === 0
      ? "same as last week"
      : weekDelta > 0
        ? `+${weekDelta} vs last week`
        : `${weekDelta} vs last week`

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total students"
        value={totalStudents.toLocaleString()}
        sub={unassignedStudents > 0 ? `${unassignedStudents} unassigned` : "all assigned"}
        icon={Users}
        color="#6C5CE7"
        href="/users"
        highlight
      />
      <StatCard
        label="Schools"
        value={totalSchools.toLocaleString()}
        icon={School}
        color="#3b82f6"
        href="/schools"
      />
      <StatCard
        label="Classes"
        value={totalClasses.toLocaleString()}
        icon={GraduationCap}
        color="#10b981"
        href="/classes"
      />
      <StatCard
        label="Content items"
        value={(totalSubjects + totalChapters).toLocaleString()}
        sub={`${totalSubjects} subjects · ${totalChapters} chapters`}
        icon={BookOpen}
        color="#f59e0b"
        href="/content"
      />

      <StatCard
        label="Boards"
        value={totalBoards.toLocaleString()}
        icon={Landmark}
        color="#ec4899"
        href="/boards"
      />
      <StatCard
        label="Unassigned students"
        value={unassignedStudents.toLocaleString()}
        sub={
          totalStudents > 0
            ? `${Math.round((unassignedStudents / totalStudents) * 100)}% of students`
            : undefined
        }
        icon={UserX}
        color="#f43f5e"
      />
      <StatCard
        label="New this week"
        value={signupsThisWeek.toLocaleString()}
        sub={weekDeltaLabel}
        icon={weekDelta >= 0 ? TrendingUp : TrendingDown}
        color={weekDelta >= 0 ? "#10b981" : "#f43f5e"}
      />
      <StatCard
        label="Student engagement"
        value={
          totalStudents > 0
            ? `${Math.round((assignedStudents / totalStudents) * 100)}%`
            : "0%"
        }
        sub={`${assignedStudents} of ${totalStudents} in a class`}
        icon={UserCheck}
        color="#6C5CE7"
        href="/users"
      />
    </div>
  )
}
