import type {
  SupportTicketIssueArea,
  SupportTicketStatus,
} from "@prisma/client"
import { z } from "zod"

export type TicketIssueArea = SupportTicketIssueArea
export type TicketStatus = SupportTicketStatus

export const SUPPORT_RESPONSE_TIME_LABEL = "24–48 business hours"

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

const issueAreaValues = ISSUE_AREA_OPTIONS.map((option) => option.value) as [
  TicketIssueArea,
  ...TicketIssueArea[],
]

export const createSupportTicketSchema = z.object({
  issueArea: z.enum(issueAreaValues, {
    errorMap: () => ({ message: "Select an issue area" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please describe your issue in at least 10 characters")
    .max(4000, "Message is too long"),
})

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>

export type StudentTicketListItem = {
  id: string
  ticketNumber: string
  issueArea: TicketIssueArea
  issueAreaLabel: string
  status: TicketStatus
  statusLabel: string
  createdAt: Date
}

export type StudentTicketDetail = StudentTicketListItem & {
  message: string
  adminNote: string | null
  resolvedAt: Date | null
  updatedAt: Date
}

export type HelpPageData = {
  tickets: StudentTicketListItem[]
}

export function issueAreaLabel(area: TicketIssueArea): string {
  return (
    ISSUE_AREA_OPTIONS.find((option) => option.value === area)?.label ?? area
  )
}

export function ticketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case "OPEN":
      return "Open"
    case "IN_PROGRESS":
      return "In progress"
    case "RESOLVED":
      return "Resolved"
    case "CLOSED":
      return "Closed"
    default:
      return status
  }
}

export function ticketStatusTone(
  status: TicketStatus
): "default" | "secondary" | "success" | "muted" {
  switch (status) {
    case "OPEN":
      return "default"
    case "IN_PROGRESS":
      return "secondary"
    case "RESOLVED":
      return "success"
    case "CLOSED":
      return "muted"
    default:
      return "default"
  }
}

export function studentTicketHref(ticketId: string): string {
  return `/help/tickets/${ticketId}`
}

export function previewMessage(message: string, maxLength = 120): string {
  const trimmed = message.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trimEnd()}…`
}
