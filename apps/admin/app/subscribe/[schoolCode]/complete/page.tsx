import type { Metadata } from "next"

import { loadSubscriptionCheckoutSession } from "@/features/schools/server/load-subscription-checkout"
import { SubscriptionCheckoutCompleteScreen } from "@/features/schools/view/subscription-checkout-complete-screen"

type SubscribeCompletePageProps = {
  params: Promise<{ schoolCode: string }>
}

export const metadata: Metadata = {
  title: "Subscription setup complete - Orvantaa",
  description: "Your Orvantaa subscription has been received.",
}

export default async function SubscribeCompletePage({
  params,
}: SubscribeCompletePageProps) {
  const { schoolCode } = await params
  const session = await loadSubscriptionCheckoutSession(schoolCode)

  return (
    <SubscriptionCheckoutCompleteScreen schoolName={session?.schoolName ?? null} />
  )
}
