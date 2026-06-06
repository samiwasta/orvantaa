import type {
  AdminNotificationKind as PrismaKind,
  AdminNotificationPriority as PrismaPriority,
} from "@prisma/client"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  Building2,
  CreditCard,
  UserMinus,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react"

export type NotificationKind =
  | "team_member_added"
  | "team_member_removed"
  | "subscription_payment_failed"
  | "subscription_payment_due"
  | "subscription_payment_late"
  | "school_subscription_inactive"
  | "school_subscription_hold"
  | "school_subscription_blocked"
  | "students_unassigned"
  | "maintenance_mode"
  | "system"

export type NotificationPriority = "low" | "normal" | "high" | "urgent"

export type AdminNotificationItem = {
  id: string
  kind: NotificationKind
  priority: NotificationPriority
  title: string
  body: string
  href: string | null
  createdAt: string
  read: boolean
}

export type AdminNotificationSummary = {
  unreadCount: number
  items: AdminNotificationItem[]
}

export type UpsertNotificationInput = {
  dedupeKey: string
  kind: NotificationKind
  priority?: NotificationPriority
  title: string
  body: string
  href?: string | null
  metadata?: Record<string, unknown>
}

const KIND_MAP: Record<PrismaKind, NotificationKind> = {
  TEAM_MEMBER_ADDED: "team_member_added",
  TEAM_MEMBER_REMOVED: "team_member_removed",
  SUBSCRIPTION_PAYMENT_FAILED: "subscription_payment_failed",
  SUBSCRIPTION_PAYMENT_DUE: "subscription_payment_due",
  SUBSCRIPTION_PAYMENT_LATE: "subscription_payment_late",
  SCHOOL_SUBSCRIPTION_INACTIVE: "school_subscription_inactive",
  SCHOOL_SUBSCRIPTION_HOLD: "school_subscription_hold",
  SCHOOL_SUBSCRIPTION_BLOCKED: "school_subscription_blocked",
  STUDENTS_UNASSIGNED: "students_unassigned",
  MAINTENANCE_MODE: "maintenance_mode",
  SYSTEM: "system",
}

const PRISMA_KIND_MAP: Record<NotificationKind, PrismaKind> = {
  team_member_added: "TEAM_MEMBER_ADDED",
  team_member_removed: "TEAM_MEMBER_REMOVED",
  subscription_payment_failed: "SUBSCRIPTION_PAYMENT_FAILED",
  subscription_payment_due: "SUBSCRIPTION_PAYMENT_DUE",
  subscription_payment_late: "SUBSCRIPTION_PAYMENT_LATE",
  school_subscription_inactive: "SCHOOL_SUBSCRIPTION_INACTIVE",
  school_subscription_hold: "SCHOOL_SUBSCRIPTION_HOLD",
  school_subscription_blocked: "SCHOOL_SUBSCRIPTION_BLOCKED",
  students_unassigned: "STUDENTS_UNASSIGNED",
  maintenance_mode: "MAINTENANCE_MODE",
  system: "SYSTEM",
}

const PRIORITY_MAP: Record<PrismaPriority, NotificationPriority> = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
}

const PRISMA_PRIORITY_MAP: Record<NotificationPriority, PrismaPriority> = {
  low: "LOW",
  normal: "NORMAL",
  high: "HIGH",
  urgent: "URGENT",
}

export const SMART_NOTIFICATION_PREFIXES = [
  "school-status:",
  "payment-failed:",
  "payment-due:",
  "payment-late:",
  "students-unassigned",
  "maintenance-mode",
] as const

export function mapPrismaNotificationKind(kind: PrismaKind): NotificationKind {
  return KIND_MAP[kind]
}

export function mapNotificationKindToPrisma(kind: NotificationKind): PrismaKind {
  return PRISMA_KIND_MAP[kind]
}

export function mapPrismaNotificationPriority(
  priority: PrismaPriority
): NotificationPriority {
  return PRIORITY_MAP[priority]
}

export function mapNotificationPriorityToPrisma(
  priority: NotificationPriority
): PrismaPriority {
  return PRISMA_PRIORITY_MAP[priority]
}

export function notificationIconForKind(kind: NotificationKind): LucideIcon {
  switch (kind) {
    case "team_member_added":
      return UserPlus
    case "team_member_removed":
      return UserMinus
    case "subscription_payment_failed":
    case "subscription_payment_due":
    case "subscription_payment_late":
      return CreditCard
    case "school_subscription_inactive":
    case "school_subscription_hold":
    case "school_subscription_blocked":
      return Building2
    case "students_unassigned":
      return Users
    case "maintenance_mode":
      return Wrench
    default:
      return Bell
  }
}

export function notificationAccentClass(priority: NotificationPriority): string {
  switch (priority) {
    case "urgent":
      return "bg-red-500/10 text-red-700"
    case "high":
      return "bg-amber-500/10 text-amber-800"
    case "low":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-[#6C5CE7]/10 text-[#6C5CE7]"
  }
}

export function formatRelativeNotificationTime(iso: string): string {
  const date = new Date(iso)
  const now = Date.now()
  const diffSec = Math.round((date.getTime() - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  const absSec = Math.abs(diffSec)
  if (absSec < 60) return rtf.format(diffSec, "second")

  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute")

  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour")

  const diffDay = Math.round(diffHour / 24)
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, "day")

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function formatUnreadBadgeCount(count: number): string {
  if (count <= 0) return ""
  if (count > 9) return "9+"
  return String(count)
}
