import type { AppUserRole } from "@/features/user/model/user"

function adminAppBase(): string {
  return (
    process.env.ADMIN_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

function studentAppBase(): string {
  return (
    process.env.STUDENT_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_STUDENT_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

export function adminLoginUrl(): string {
  return `${adminAppBase()}/auth`
}

export function studentLoginUrl(): string {
  return `${studentAppBase()}/auth`
}

export function buildPasswordResetUrl(
  rawToken: string,
  role: AppUserRole = "admin"
): string {
  const base = role === "student" ? studentAppBase() : adminAppBase()
  return `${base}/reset-password?token=${rawToken}`
}

export function buildAdminPasswordResetUrl(rawToken: string): string {
  return buildPasswordResetUrl(rawToken, "admin")
}
