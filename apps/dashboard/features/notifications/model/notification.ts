import type { LucideIcon } from "lucide-react"
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  KeyRound,
  LifeBuoy,
  Wrench,
} from "lucide-react"

import type {
  StudentNotificationKind as PrismaKind,
  StudentNotificationPriority as PrismaPriority,
} from "@/lib/generated/prisma"

export type NotificationKind =
  | "quiz_completed"
  | "lesson_completed"
  | "password_change_required"
  | "maintenance_mode"
  | "support_ticket"
  | "system"

export type NotificationPriority = "low" | "normal" | "high" | "urgent"

export type StudentNotificationItem = {
  id: string
  kind: NotificationKind
  priority: NotificationPriority
  title: string
  body: string
  href: string | null
  createdAt: string
  read: boolean
}

export type StudentNotificationSummary = {
  unreadCount: number
  items: StudentNotificationItem[]
}

export type UpsertStudentNotificationInput = {
  dedupeKey: string
  kind: NotificationKind
  priority?: NotificationPriority
  title: string
  body: string
  href?: string | null
  metadata?: Record<string, unknown>
}

export const SMART_STUDENT_NOTIFICATION_PREFIXES = [
  "password-change-required",
  "maintenance-mode",
] as const

const KIND_MAP: Record<PrismaKind, NotificationKind> = {
  QUIZ_COMPLETED: "quiz_completed",
  LESSON_COMPLETED: "lesson_completed",
  PASSWORD_CHANGE_REQUIRED: "password_change_required",
  MAINTENANCE_MODE: "maintenance_mode",
  SUPPORT_TICKET: "support_ticket",
  SYSTEM: "system",
}

const PRISMA_KIND_MAP: Record<NotificationKind, PrismaKind> = {
  quiz_completed: "QUIZ_COMPLETED",
  lesson_completed: "LESSON_COMPLETED",
  password_change_required: "PASSWORD_CHANGE_REQUIRED",
  maintenance_mode: "MAINTENANCE_MODE",
  support_ticket: "SUPPORT_TICKET",
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

export function mapPrismaNotificationKind(kind: PrismaKind): NotificationKind {
  return KIND_MAP[kind]
}

export function mapNotificationKindToPrisma(
  kind: NotificationKind
): PrismaKind {
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
    case "quiz_completed":
      return ClipboardCheck
    case "lesson_completed":
      return BookOpen
    case "password_change_required":
      return KeyRound
    case "maintenance_mode":
      return Wrench
    case "support_ticket":
      return LifeBuoy
    default:
      return Bell
  }
}

export function notificationAccentClass(
  priority: NotificationPriority
): string {
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

export function emptyStudentNotificationSummary(): StudentNotificationSummary {
  return { unreadCount: 0, items: [] }
}
