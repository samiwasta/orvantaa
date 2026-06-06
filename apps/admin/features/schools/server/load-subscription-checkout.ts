"use server"

import { schoolRecurringSubscriptionService } from "@/features/schools/service/school-recurring-subscription.service"

import type { SubscriptionCheckoutSession } from "../model/subscription-checkout"

export async function loadSubscriptionCheckoutSession(
  routeCode: string
): Promise<SubscriptionCheckoutSession | null> {
  return schoolRecurringSubscriptionService.getCheckoutSession(routeCode)
}
