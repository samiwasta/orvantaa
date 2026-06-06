import { createHmac, timingSafeEqual } from "crypto"

import { getRazorpayConfig } from "./config"

export function verifyRazorpaySubscriptionPaymentSignature(input: {
  razorpayPaymentId: string
  razorpaySubscriptionId: string
  razorpaySignature: string
}): boolean {
  const { keySecret, enabled } = getRazorpayConfig()
  if (!enabled || !keySecret) return false

  const paymentId = input.razorpayPaymentId.trim()
  const subscriptionId = input.razorpaySubscriptionId.trim()
  const signature = input.razorpaySignature.trim()

  if (!paymentId || !subscriptionId || !signature) return false

  const expected = createHmac("sha256", keySecret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex")

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8")
    )
  } catch {
    return false
  }
}
