import { NextResponse } from "next/server"

import { verifySubscriptionCheckoutSchema } from "@/features/schools/model/subscription-checkout"
import { schoolRecurringSubscriptionService } from "@/features/schools/service/school-recurring-subscription.service"
import { isRazorpayConfigured } from "@/lib/payments/razorpay"

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Razorpay is not configured." },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    )
  }

  const parsed = verifySubscriptionCheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Missing payment verification fields." },
      { status: 400 }
    )
  }

  try {
    await schoolRecurringSubscriptionService.verifyCheckoutPayment(parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payment verification failed."
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
