import type { AppUserRole } from "@/features/user/model/user"

const DEFAULT_ADMIN_APP_URL = "http://localhost:3001"
const DEFAULT_STUDENT_APP_URL = "http://localhost:3000"

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "")
}

export function getAdminAppUrl(): string {
  return normalizeBaseUrl(
    process.env.ADMIN_APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      DEFAULT_ADMIN_APP_URL
  )
}

export function getStudentAppUrl(): string {
  return normalizeBaseUrl(
    process.env.STUDENT_APP_URL?.trim() || DEFAULT_STUDENT_APP_URL
  )
}

export function adminLoginUrl(): string {
  return `${getAdminAppUrl()}/auth`
}

export function studentLoginUrl(): string {
  return `${getStudentAppUrl()}/auth`
}

export function buildAdminPasswordResetUrl(rawToken: string): string {
  return `${getAdminAppUrl()}/reset-password?token=${rawToken}`
}

export function buildStudentPasswordResetUrl(rawToken: string): string {
  return `${getStudentAppUrl()}/reset-password?token=${rawToken}`
}

export function buildPasswordResetUrl(
  rawToken: string,
  role: AppUserRole = "admin"
): string {
  return role === "student"
    ? buildStudentPasswordResetUrl(rawToken)
    : buildAdminPasswordResetUrl(rawToken)
}

export function buildSubscriptionCheckoutUrl(schoolCode: string): string {
  const encoded = encodeURIComponent(schoolCode.trim())
  return `${getAdminAppUrl()}/subscribe/${encoded}`
}

export function buildSubscriptionCheckoutCompleteUrl(schoolCode: string): string {
  const encoded = encodeURIComponent(schoolCode.trim())
  return `${getAdminAppUrl()}/subscribe/${encoded}/complete`
}

export function buildStudentTicketTrackUrl(ticketId: string): string {
  return `${getStudentAppUrl()}/help/tickets/${ticketId}`
}

export function buildAdminQueryDetailUrl(ticketId: string): string {
  return `${getAdminAppUrl()}/queries/${ticketId}`
}
