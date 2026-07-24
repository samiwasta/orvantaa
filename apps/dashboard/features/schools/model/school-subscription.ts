import type { SchoolSubscriptionStatus as PrismaStatus } from "@/lib/generated/prisma"

export type SchoolSubscriptionStatus =
  | "active"
  | "inactive"
  | "hold"
  | "blocked"
  | "unassigned"

export type StudentSchoolAccess = {
  allowed: boolean
  status: SchoolSubscriptionStatus
  schoolName: string | null
}

export function mapPrismaSubscriptionStatus(
  status: PrismaStatus
): Exclude<SchoolSubscriptionStatus, "unassigned"> {
  switch (status) {
    case "INACTIVE":
      return "inactive"
    case "HOLD":
      return "hold"
    case "BLOCKED":
      return "blocked"
    default:
      return "active"
  }
}

export function isSchoolSubscriptionAccessAllowed(
  status: SchoolSubscriptionStatus
): boolean {
  return status === "active" || status === "unassigned"
}

export function subscriptionAccessMessage(
  status: SchoolSubscriptionStatus
): string {
  switch (status) {
    case "inactive":
      return "Your school's subscription is inactive. Contact your school administration to restore access."
    case "hold":
      return "Your school's subscription is on hold due to a payment issue. Contact your school administration."
    case "blocked":
      return "Your school's platform access has been blocked. Contact your school administration."
    default:
      return "Platform access is unavailable for your school."
  }
}

export function subscriptionAccessTitle(
  status: SchoolSubscriptionStatus
): string {
  switch (status) {
    case "inactive":
      return "Subscription inactive"
    case "hold":
      return "Subscription on hold"
    case "blocked":
      return "Access blocked"
    default:
      return "Access unavailable"
  }
}
