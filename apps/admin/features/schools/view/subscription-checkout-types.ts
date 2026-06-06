import type { RazorpayCheckoutHandlerResponse } from "../model/razorpay-checkout"

export type SubscriptionCheckoutScreenProps = {
  session: {
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
}

export type VerifySubscriptionCheckoutPayload = RazorpayCheckoutHandlerResponse
