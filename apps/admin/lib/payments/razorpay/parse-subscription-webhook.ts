import { recordFromRazorpayPaymentEntity } from "./map-payment"
import type { RazorpayPaymentRecord } from "./types"
import {
  mapRazorpaySubscriptionStatus,
  type RazorpaySubscriptionEntity,
  unixToDate,
} from "./subscriptions"

export type ParsedSubscriptionWebhook = {
  event: string
  subscription: RazorpaySubscriptionEntity
  payment: RazorpayPaymentRecord | null
  schoolId: string | null
}

export function parseRazorpaySubscriptionWebhook(
  body: unknown
): ParsedSubscriptionWebhook | null {
  if (!body || typeof body !== "object") return null

  const event = (body as { event?: string }).event ?? ""
  if (!event.startsWith("subscription.")) return null

  const payload = (body as { payload?: Record<string, unknown> }).payload ?? {}
  const subscriptionEntity = (
    payload.subscription as { entity?: RazorpaySubscriptionEntity } | undefined
  )?.entity

  if (!subscriptionEntity?.id) return null

  const schoolId =
    subscriptionEntity.notes?.school_id ??
    subscriptionEntity.notes?.schoolId ??
    null

  let payment: RazorpayPaymentRecord | null = null
  const paymentEntity = (
    payload.payment as { entity?: Record<string, unknown> } | undefined
  )?.entity

  if (paymentEntity) {
    payment = recordFromRazorpayPaymentEntity(
      paymentEntity as Parameters<typeof recordFromRazorpayPaymentEntity>[0],
      schoolId ?? undefined
    )
    if (payment && event === "subscription.charged") {
      payment = { ...payment, status: "success" }
    }
    if (payment && event === "subscription.pending") {
      payment = { ...payment, status: "due" }
    }
    if (payment && event === "subscription.halted") {
      payment = { ...payment, status: "failed" }
    }
  }

  return {
    event,
    subscription: subscriptionEntity,
    payment,
    schoolId,
  }
}

export function subscriptionEntityToUpdate(
  entity: RazorpaySubscriptionEntity
): {
  status:
    | "CREATED"
    | "AUTHENTICATED"
    | "ACTIVE"
    | "PENDING"
    | "HALTED"
    | "CANCELLED"
    | "COMPLETED"
    | "EXPIRED"
  authUrl: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  nextChargeAt: Date | null
  cancelledAt: Date | null
} {
  const mapped = mapRazorpaySubscriptionStatus(entity.status)
  const statusMap = {
    created: "CREATED",
    authenticated: "AUTHENTICATED",
    active: "ACTIVE",
    pending: "PENDING",
    halted: "HALTED",
    cancelled: "CANCELLED",
    completed: "COMPLETED",
    expired: "EXPIRED",
  } as const

  return {
    status: statusMap[mapped],
    authUrl: entity.short_url ?? null,
    currentPeriodStart: unixToDate(entity.current_start),
    currentPeriodEnd: unixToDate(entity.current_end),
    nextChargeAt: unixToDate(entity.charge_at),
    cancelledAt:
      mapped === "cancelled" || mapped === "completed" || mapped === "expired"
        ? (unixToDate(entity.ended_at) ?? new Date())
        : null,
  }
}

export function schoolStatusFromRecurringStatus(
  status:
    | "CREATED"
    | "AUTHENTICATED"
    | "ACTIVE"
    | "PENDING"
    | "HALTED"
    | "CANCELLED"
    | "COMPLETED"
    | "EXPIRED"
): "active" | "inactive" | "hold" | null {
  switch (status) {
    case "HALTED":
      return "hold"
    case "ACTIVE":
      return null
    case "AUTHENTICATED":
    case "CREATED":
    case "PENDING":
    case "CANCELLED":
    case "COMPLETED":
    case "EXPIRED":
      return "inactive"
    default:
      return null
  }
}
