import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadSubscriptionCheckoutSession } from "@/features/schools/server/load-subscription-checkout"
import { SubscriptionCheckoutScreen } from "@/features/schools/view/subscription-checkout-screen"

type SubscribePageProps = {
  params: Promise<{ schoolCode: string }>
}

export async function generateMetadata({
  params,
}: SubscribePageProps): Promise<Metadata> {
  const { schoolCode } = await params
  const session = await loadSubscriptionCheckoutSession(schoolCode)

  return {
    title: session
      ? `Subscribe ${session.schoolName} - Orvantaa`
      : "Subscription setup - Orvantaa",
    description: "Complete Razorpay subscription authorization for your school.",
  }
}

export default async function SubscribePage({ params }: SubscribePageProps) {
  const { schoolCode } = await params
  const session = await loadSubscriptionCheckoutSession(schoolCode)

  if (!session) {
    notFound()
  }

  return <SubscriptionCheckoutScreen session={session} />
}
