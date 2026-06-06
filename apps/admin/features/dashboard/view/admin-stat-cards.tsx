import { cn } from "@workspace/ui/lib/utils"
import { Landmark, type LucideIcon, School, UserCheck, Users } from "lucide-react"
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
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.04] transition-all sm:px-5",
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
  const { totalStudents, totalSchools, totalBoards, unassignedStudents } = counts

  const assignedStudents = totalStudents - unassignedStudents

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <StatCard
        label="Total students"
        value={totalStudents.toLocaleString()}
        icon={Users}
        color="#6C5CE7"
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
        label="Boards"
        value={totalBoards.toLocaleString()}
        icon={Landmark}
        color="#ec4899"
        href="/boards"
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
      />
    </div>
  )
}
