import { createHmac, timingSafeEqual } from "crypto"

import { getRazorpayConfig } from "./config"

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const { webhookSecret, enabled } = getRazorpayConfig()
  if (!enabled || !webhookSecret) return false
  if (!signature) return false

  const expected = createHmac("sha256", webhookSecret)
    .update(rawBody)
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
