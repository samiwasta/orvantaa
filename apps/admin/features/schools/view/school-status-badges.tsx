import { cn } from "@workspace/ui/lib/utils"

import type {
  SchoolListItem,
  SchoolSubscriptionStatus,
  SchoolSyllabusStatus,
} from "../model/school-list-item"
import type { StudentMailStatus } from "../model/school-student-list-item"

const syllabusStyles: Record<SchoolSyllabusStatus, string> = {
  assigned: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partially_assigned: "border-amber-200 bg-amber-50 text-amber-800",
  not_assigned: "border-red-200 bg-red-50 text-red-700",
}

const subscriptionStyles: Record<SchoolSubscriptionStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  hold: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-red-200 bg-red-50 text-red-700",
}

function StatusChip({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  )
}

export function SyllabusStatusChip({
  status,
  label,
}: {
  status: SchoolSyllabusStatus
  label: string
}) {
  return <StatusChip label={label} className={syllabusStyles[status]} />
}

export function SyllabusStatusBadge({ school }: { school: SchoolListItem }) {
  return (
    <SyllabusStatusChip status={school.syllabusStatus} label={school.syllabusLabel} />
  )
}

export function SubscriptionStatusBadge({ school }: { school: SchoolListItem }) {
  return (
    <StatusChip
      label={school.subscriptionLabel}
      className={subscriptionStyles[school.subscriptionStatus]}
    />
  )
}

const mailStyles: Record<StudentMailStatus, string> = {
  sent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  not_sent: "border-slate-200 bg-slate-100 text-slate-600",
}

export function MailStatusBadge({ label, status }: { label: string; status: StudentMailStatus }) {
  return <StatusChip label={label} className={mailStyles[status]} />
}
