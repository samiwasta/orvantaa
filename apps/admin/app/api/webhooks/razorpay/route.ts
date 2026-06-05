import { NextResponse } from "next/server"

import { schoolSubscriptionService } from "@/features/schools/service/school-subscription.service"
import { isRazorpayConfigured } from "@/lib/payments/razorpay"
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay/verify-webhook"

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Razorpay is not configured" },
      { status: 503 }
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature")

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook signature" },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    )
  }

  try {
    const processed = await schoolSubscriptionService.handleRazorpayWebhook(body)
    return NextResponse.json({ ok: true, processed })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
