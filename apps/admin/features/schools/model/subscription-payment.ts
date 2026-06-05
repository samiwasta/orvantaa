import type { SubscriptionPaymentStatus as PrismaStatus } from "@prisma/client"

export type SubscriptionPaymentStatus =
  | "due"
  | "success"
  | "failed"
  | "late"
  | "pending"

export type SubscriptionPaymentListItem = {
  id: string
  transactionId: string
  transactionDate: string
  transactionDateIso: string
  serviceName: string
  paymentMethod: string | null
  amountLabel: string | null
  status: SubscriptionPaymentStatus
  statusLabel: string
  invoiceUrl: string | null
}

export type SubscriptionPaymentsConfig = {
  razorpayConfigured: boolean
  razorpayEnabled: boolean
}

export function mapPrismaPaymentStatus(
  status: PrismaStatus
): SubscriptionPaymentStatus {
  switch (status) {
    case "DUE":
      return "due"
    case "SUCCESS":
      return "success"
    case "FAILED":
      return "failed"
    case "LATE":
      return "late"
    default:
      return "pending"
  }
}

export function mapPaymentStatusToPrisma(
  status: SubscriptionPaymentStatus
): PrismaStatus {
  switch (status) {
    case "due":
      return "DUE"
    case "success":
      return "SUCCESS"
    case "failed":
      return "FAILED"
    case "late":
      return "LATE"
    default:
      return "PENDING"
  }
}

export function formatPaymentStatusLabel(status: SubscriptionPaymentStatus): string {
  switch (status) {
    case "due":
      return "Due"
    case "success":
      return "Success"
    case "failed":
      return "Failed"
    case "late":
      return "Late"
    default:
      return "Pending"
  }
}

export function formatAmountLabel(
  amountPaise: number | null,
  currency: string
): string | null {
  if (amountPaise == null) return null
  const amount = amountPaise / 100
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatTransactionDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export type SubscriptionPaymentEmailKind =
  | "due"
  | "success"
  | "failed"
  | "late"

export function paymentStatusToEmailKind(
  status: SubscriptionPaymentStatus
): SubscriptionPaymentEmailKind | null {
  switch (status) {
    case "due":
      return "due"
    case "success":
      return "success"
    case "failed":
      return "failed"
    case "late":
      return "late"
    default:
      return null
  }
}
