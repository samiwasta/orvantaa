const DEFAULT_STUDENT_APP_URL = "http://localhost:3000"

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "")
}

export function getStudentAppUrl(): string {
  return normalizeBaseUrl(
    process.env.STUDENT_APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      DEFAULT_STUDENT_APP_URL
  )
}

export function studentLoginUrl(): string {
  return `${getStudentAppUrl()}/auth`
}

export function buildStudentPasswordResetUrl(rawToken: string): string {
  return `${getStudentAppUrl()}/reset-password?token=${rawToken}`
}

export function buildQuizSessionReportUrl(rawToken: string): string {
  return `${getStudentAppUrl()}/quiz-session/${encodeURIComponent(rawToken)}`
}

export function buildStudentTicketTrackUrl(ticketId: string): string {
  return `${getStudentAppUrl()}/help/tickets/${ticketId}`
}

export function buildAdminQueryDetailUrl(ticketId: string): string {
  const base =
    process.env.ADMIN_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim() ||
    "http://localhost:3001"
  return `${base.replace(/\/$/, "")}/queries/${ticketId}`
}
