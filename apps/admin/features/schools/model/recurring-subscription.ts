import type { RecurringSubscriptionStatus as PrismaStatus } from "@/lib/generated/prisma"
import { z } from "zod"

export type RecurringSubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired"

export type RecurringSubscriptionListItem = {
  id: string
  razorpaySubscriptionId: string
  status: RecurringSubscriptionStatus
  statusLabel: string
  amountLabel: string
  principalAmountLabel: string | null
  studentCount: number
  planName: string
  authUrl: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  nextChargeAt: string | null
  cancelledAt: string | null
}

export type RecurringSubscriptionConfig = {
  configured: boolean
  principalAmountPaise: number
  principalAmountLabel: string | null
  planName: string
  autoStartEnabled: boolean
}

export const startRecurringSubscriptionSchema = z.object({
  sendEmail: z.boolean().optional().default(true),
})

export type StartRecurringSubscriptionInput = z.infer<
  typeof startRecurringSubscriptionSchema
>

export type StartRecurringSubscriptionResult = {
  authUrl: string | null
  razorpaySubscriptionId: string
  status: RecurringSubscriptionStatus
}

export function mapPrismaRecurringStatus(
  status: PrismaStatus
): RecurringSubscriptionStatus {
  switch (status) {
    case "AUTHENTICATED":
      return "authenticated"
    case "ACTIVE":
      return "active"
    case "PENDING":
      return "pending"
    case "HALTED":
      return "halted"
    case "CANCELLED":
      return "cancelled"
    case "COMPLETED":
      return "completed"
    case "EXPIRED":
      return "expired"
    default:
      return "created"
  }
}

export function mapRecurringStatusToPrisma(
  status: RecurringSubscriptionStatus
): PrismaStatus {
  switch (status) {
    case "authenticated":
      return "AUTHENTICATED"
    case "active":
      return "ACTIVE"
    case "pending":
      return "PENDING"
    case "halted":
      return "HALTED"
    case "cancelled":
      return "CANCELLED"
    case "completed":
      return "COMPLETED"
    case "expired":
      return "EXPIRED"
    default:
      return "CREATED"
  }
}

export function formatRecurringStatusLabel(
  status: RecurringSubscriptionStatus
): string {
  switch (status) {
    case "authenticated":
      return "Authenticated"
    case "active":
      return "Active"
    case "pending":
      return "Pending payment"
    case "halted":
      return "Halted"
    case "cancelled":
      return "Cancelled"
    case "completed":
      return "Completed"
    case "expired":
      return "Expired"
    default:
      return "Awaiting setup"
  }
}

export function formatRecurringDate(date: Date | null): string | null {
  if (!date) return null
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function isRecurringSubscriptionLive(
  status: RecurringSubscriptionStatus
): boolean {
  return (
    status === "active" ||
    status === "authenticated" ||
    status === "created" ||
    status === "pending"
  )
}

export function isRecurringSubscriptionUpdatable(
  status: RecurringSubscriptionStatus
): boolean {
  return status === "active" || status === "authenticated"
}

export function isRecurringSubscriptionTerminal(
  status: RecurringSubscriptionStatus
): boolean {
  return (
    status === "cancelled" ||
    status === "completed" ||
    status === "expired"
  )
}
