import { getRazorpayConfig } from "./config"

export type CreateRazorpayPaymentLinkInput = {
  amountPaise: number
  currency: string
  description: string
  schoolId: string
  schoolName: string
  serviceName: string
  customerEmail?: string | null
  customerName?: string | null
  referenceId: string
}

export type CreateRazorpayPaymentLinkResult = {
  paymentLinkId: string
  shortUrl: string
}

function authHeader(keyId: string, keySecret: string): string {
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  return `Basic ${token}`
}

export async function createRazorpayPaymentLink(
  input: CreateRazorpayPaymentLinkInput
): Promise<CreateRazorpayPaymentLinkResult> {
  const config = getRazorpayConfig()
  if (!config.enabled) {
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    )
  }

  const expireBy = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30

  const body: Record<string, unknown> = {
    amount: input.amountPaise,
    currency: input.currency.toUpperCase(),
    accept_partial: false,
    description: input.description,
    reference_id: input.referenceId,
    expire_by: expireBy,
    reminder_enable: true,
    notes: {
      school_id: input.schoolId,
      service_name: input.serviceName,
    },
    notify: {
      sms: false,
      email: false,
    },
  }

  if (input.customerEmail?.trim()) {
    body.customer = {
      email: input.customerEmail.trim(),
      name: input.customerName?.trim() || input.schoolName,
    }
  }

  const response = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: {
      Authorization: authHeader(config.keyId, config.keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `[Razorpay] Failed to create payment link (${response.status}): ${errorBody.slice(0, 240)}`
    )
  }

  const data = (await response.json()) as {
    id?: string
    short_url?: string
  }

  if (!data.id || !data.short_url) {
    throw new Error("[Razorpay] Payment link response was missing id or short_url.")
  }

  return {
    paymentLinkId: data.id,
    shortUrl: data.short_url,
  }
}
