import type { RazorpayPaymentRecord, RazorpayPaymentStatus } from "./types"

const DEFAULT_SERVICE_NAME = "Orvantaa Platform Subscription"

export function mapRazorpayEntityStatus(
  paymentStatus?: string,
  orderStatus?: string
): RazorpayPaymentStatus {
  const status = (paymentStatus ?? orderStatus ?? "").toLowerCase()

  if (status === "captured" || status === "paid") return "success"
  if (status === "failed") return "failed"
  if (status === "created" || status === "authorized") return "pending"
  if (status === "due" || status === "issued") return "due"

  return "pending"
}

export function mapWebhookEventToStatus(event: string): RazorpayPaymentStatus {
  switch (event) {
    case "payment.captured":
    case "order.paid":
      return "success"
    case "payment.failed":
      return "failed"
    case "payment.due":
    case "invoice.expired":
      return "due"
    case "payment.overdue":
      return "late"
    default:
      return "pending"
  }
}

export function formatPaymentMethod(method?: string | null): string | null {
  if (!method) return null
  const normalized = method.trim().toLowerCase()
  const labels: Record<string, string> = {
    card: "Card",
    upi: "UPI",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
    paylater: "Pay Later",
    bank_transfer: "Bank Transfer",
  }
  return labels[normalized] ?? method
}

export function buildInvoiceUrl(
  paymentId?: string,
  invoiceId?: string | null
): string | null {
  if (invoiceId) {
    return `https://dashboard.razorpay.com/app/invoices/${invoiceId}`
  }
  if (paymentId) {
    return `https://dashboard.razorpay.com/app/payments/${paymentId}`
  }
  return null
}

export function recordFromRazorpayPaymentEntity(
  entity: {
    id?: string
    order_id?: string
    amount?: number
    currency?: string
    status?: string
    method?: string
    created_at?: number
    invoice_id?: string
    notes?: Record<string, string>
  },
  fallbackSchoolId?: string
): RazorpayPaymentRecord | null {
  const transactionId = entity.id ?? entity.order_id
  if (!transactionId) return null

  const schoolId = entity.notes?.school_id ?? entity.notes?.schoolId ?? fallbackSchoolId ?? null
  const serviceName =
    entity.notes?.service_name ??
    entity.notes?.serviceName ??
    DEFAULT_SERVICE_NAME

  return {
    transactionId,
    razorpayOrderId: entity.order_id ?? null,
    razorpayPaymentId: entity.id ?? null,
    transactionDate: entity.created_at
      ? new Date(entity.created_at * 1000)
      : new Date(),
    serviceName,
    paymentMethod: formatPaymentMethod(entity.method),
    amountPaise: entity.amount ?? null,
    currency: (entity.currency ?? "INR").toUpperCase(),
    status: mapRazorpayEntityStatus(entity.status),
    invoiceUrl: buildInvoiceUrl(entity.id, entity.invoice_id),
    paymentUrl: null,
    schoolId,
  }
}

export function recordFromRazorpayOrderEntity(
  entity: {
    id?: string
    amount?: number
    currency?: string
    status?: string
    notes?: Record<string, string>
    created_at?: number
  },
  fallbackSchoolId?: string
): RazorpayPaymentRecord | null {
  const transactionId = entity.id
  if (!transactionId) return null

  const schoolId = entity.notes?.school_id ?? entity.notes?.schoolId ?? fallbackSchoolId ?? null
  const serviceName =
    entity.notes?.service_name ??
    entity.notes?.serviceName ??
    DEFAULT_SERVICE_NAME

  return {
    transactionId,
    razorpayOrderId: entity.id ?? null,
    razorpayPaymentId: null,
    transactionDate: entity.created_at
      ? new Date(entity.created_at * 1000)
      : new Date(),
    serviceName,
    paymentMethod: null,
    amountPaise: entity.amount ?? null,
    currency: (entity.currency ?? "INR").toUpperCase(),
    status: mapRazorpayEntityStatus(undefined, entity.status),
    invoiceUrl: buildInvoiceUrl(undefined, null),
    paymentUrl: null,
    schoolId,
  }
}
