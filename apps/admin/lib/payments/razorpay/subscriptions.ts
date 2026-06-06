import { razorpayRequest } from "./http"

export type RazorpayPlan = {
  id: string
  item: {
    name: string
    amount: number
    currency: string
  }
  period: string
  interval: number
}

export type RazorpayCustomer = {
  id: string
  email?: string
  name?: string
}

export type RazorpaySubscriptionEntity = {
  id: string
  plan_id: string
  customer_id: string
  status: string
  short_url?: string | null
  current_start?: number | null
  current_end?: number | null
  charge_at?: number | null
  ended_at?: number | null
  notes?: Record<string, string>
}

export type CreateRazorpayPlanInput = {
  amountPaise: number
  currency: string
  name: string
  description?: string
}

export async function createRazorpayPlan(
  input: CreateRazorpayPlanInput
): Promise<RazorpayPlan> {
  return razorpayRequest<RazorpayPlan>("/plans", {
    method: "POST",
    body: {
      period: "monthly",
      interval: 1,
      item: {
        name: input.name,
        amount: input.amountPaise,
        currency: input.currency.toUpperCase(),
        description: input.description ?? input.name,
      },
    },
  })
}

export async function createRazorpayCustomer(input: {
  name: string
  email: string
  schoolId: string
}): Promise<RazorpayCustomer> {
  return razorpayRequest<RazorpayCustomer>("/customers", {
    method: "POST",
    body: {
      name: input.name,
      email: input.email,
      notes: {
        school_id: input.schoolId,
      },
    },
  })
}

export async function createRazorpaySubscription(input: {
  planId: string
  customerId: string
  schoolId: string
  totalCount: number
  quantity: number
}): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>("/subscriptions", {
    method: "POST",
    body: {
      plan_id: input.planId,
      customer_id: input.customerId,
      total_count: input.totalCount,
      quantity: input.quantity,
      customer_notify: 1,
      notes: {
        school_id: input.schoolId,
      },
    },
  })
}

export async function fetchRazorpaySubscription(
  subscriptionId: string
): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>(
    `/subscriptions/${subscriptionId}`
  )
}

export async function cancelRazorpaySubscription(
  subscriptionId: string,
  options?: { cancelAtCycleEnd?: boolean }
): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>(
    `/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      body: {
        cancel_at_cycle_end: options?.cancelAtCycleEnd ? 1 : 0,
      },
    }
  )
}

export async function updateRazorpaySubscriptionQuantity(input: {
  subscriptionId: string
  quantity: number
  scheduleChangeAt: "now" | "cycle_end"
  customerNotify?: boolean
}): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>(
    `/subscriptions/${input.subscriptionId}`,
    {
      method: "PATCH",
      body: {
        quantity: input.quantity,
        schedule_change_at: input.scheduleChangeAt,
        customer_notify: input.customerNotify === false ? 0 : 1,
      },
    }
  )
}

export function mapRazorpaySubscriptionStatus(
  status: string
):
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired" {
  const normalized = status.trim().toLowerCase()
  switch (normalized) {
    case "authenticated":
      return "authenticated"
    case "active":
      return "active"
    case "pending":
      return "pending"
    case "halted":
      return "halted"
    case "cancelled":
      return "cancelled"
    case "completed":
      return "completed"
    case "expired":
      return "expired"
    default:
      return "created"
  }
}

export function unixToDate(value: number | null | undefined): Date | null {
  if (value == null || value <= 0) return null
  return new Date(value * 1000)
}
