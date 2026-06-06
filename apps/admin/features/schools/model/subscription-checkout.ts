import { z } from "zod"

export const verifySubscriptionCheckoutSchema = z.object({
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_subscription_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
})

export type VerifySubscriptionCheckoutInput = z.infer<
  typeof verifySubscriptionCheckoutSchema
>

export type SubscriptionCheckoutSession = {
  schoolCode: string
  schoolName: string
  planName: string
  amountLabel: string
  subscriptionId: string
  keyId: string
  callbackUrl: string
  prefill: {
    name: string
    email: string
  }
  status: "ready" | "completed" | "unavailable"
  statusMessage: string | null
}
