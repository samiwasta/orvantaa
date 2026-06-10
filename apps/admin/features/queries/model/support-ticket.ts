import type {
  SupportTicketIssueArea,
  SupportTicketStatus,
} from "@prisma/client"
import { z } from "zod"

export type TicketIssueArea = SupportTicketIssueArea
export type TicketStatus = SupportTicketStatus

export const ISSUE_AREA_OPTIONS: {
  value: TicketIssueArea
  label: string
}[] = [
  { value: "ACCOUNT_PROFILE", label: "Account & Profile" },
  { value: "LOGIN_PASSWORD", label: "Login & Password" },
  { value: "SUBJECTS_LESSONS", label: "Subjects & Lessons" },
  { value: "QUIZZES", label: "Quizzes & Assessments" },
  { value: "PERFORMANCE_REPORTS", label: "Performance & Reports" },
  { value: "AI_TUTOR", label: "AI Tutor" },
  { value: "NOTIFICATIONS", label: "Notifications" },
  { value: "TECHNICAL", label: "Technical Issue / Bug" },
  { value: "OTHER", label: "Other" },
]

export const TICKET_STATUS_OPTIONS: {
  value: TicketStatus
  label: string
}[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
]

export type QueryListItem = {
  id: string
  ticketNumber: string
  issueArea: TicketIssueArea
  issueAreaLabel: string
  status: TicketStatus
  statusLabel: string
  studentName: string
  studentEmail: string
  classLabel: string | null
  messagePreview: string
  createdAt: Date
  updatedAt: Date
}

export type QueryDetail = QueryListItem & {
  message: string
  adminNote: string | null
  resolvedAt: Date | null
  schoolName: string | null
  username: string
  studentCode: string | null
  phone: string | null
}

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  adminNote: z.string().trim().max(4000).optional().default(""),
})

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>

export function issueAreaLabel(area: TicketIssueArea): string {
  return (
    ISSUE_AREA_OPTIONS.find((option) => option.value === area)?.label ?? area
  )
}

export function ticketStatusLabel(status: TicketStatus): string {
  return (
    TICKET_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  )
}

export function queryDetailHref(ticketId: string): string {
  return `/queries/${ticketId}`
}

export function studentTicketHref(ticketId: string): string {
  return `/help/tickets/${ticketId}`
}

export function previewMessage(message: string, maxLength = 120): string {
  const trimmed = message.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trimEnd()}…`
}
