import { prisma } from "@/lib/db"
import {
  createRazorpayPlan,
  isRazorpayConfigured,
} from "@/lib/payments/razorpay"

import { PLATFORM_SETTINGS_ID } from "../model/platform-settings"

export type SubscriptionPlanConfig = {
  planId: string
  principalAmountPaise: number
  planName: string
  billingCycles: number
  currency: string
}

export class SubscriptionPlanService {
  async getBillingConfig(): Promise<{
    configured: boolean
    principalAmountPaise: number
    planName: string
    billingCycles: number
    autoStartEnabled: boolean
  }> {
    const row = await prisma.platformSettings.findUnique({
      where: { id: PLATFORM_SETTINGS_ID },
      select: {
        subscriptionPrincipalAmountPaise: true,
        subscriptionPlanName: true,
        subscriptionBillingCycles: true,
        autoStartSchoolSubscriptions: true,
      },
    })

    return {
      configured: isRazorpayConfigured(),
      principalAmountPaise: row?.subscriptionPrincipalAmountPaise ?? 0,
      planName: row?.subscriptionPlanName ?? "Orvantaa Platform Subscription",
      billingCycles: row?.subscriptionBillingCycles ?? 120,
      autoStartEnabled: row?.autoStartSchoolSubscriptions ?? true,
    }
  }

  async ensurePlatformPlan(): Promise<SubscriptionPlanConfig> {
    if (!isRazorpayConfigured()) {
      throw new Error(
        "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
      )
    }

    const row = await prisma.platformSettings.findUnique({
      where: { id: PLATFORM_SETTINGS_ID },
    })

    if (!row) {
      throw new Error("Platform settings not found.")
    }

    const principalAmountPaise = row.subscriptionPrincipalAmountPaise
    const planName = row.subscriptionPlanName.trim() || "Orvantaa Platform Subscription"
    const billingCycles = row.subscriptionBillingCycles || 120

    if (principalAmountPaise <= 0) {
      throw new Error(
        "Set the principal amount per student in Subscription Settings before starting subscriptions."
      )
    }

    if (row.razorpayPlanId) {
      return {
        planId: row.razorpayPlanId,
        principalAmountPaise,
        planName,
        billingCycles,
        currency: "INR",
      }
    }

    const plan = await createRazorpayPlan({
      amountPaise: principalAmountPaise,
      currency: "INR",
      name: planName,
      description: `${planName} — per student, monthly`,
    })

    await prisma.platformSettings.update({
      where: { id: PLATFORM_SETTINGS_ID },
      data: { razorpayPlanId: plan.id },
    })

    return {
      planId: plan.id,
      principalAmountPaise,
      planName,
      billingCycles,
      currency: "INR",
    }
  }

  async refreshPlatformPlanIfNeeded(input: {
    amountPaise: number
    previousAmountPaise: number
  }): Promise<void> {
    if (input.amountPaise === input.previousAmountPaise) return
    if (input.amountPaise <= 0) {
      await prisma.platformSettings.update({
        where: { id: PLATFORM_SETTINGS_ID },
        data: { razorpayPlanId: null },
      })
      return
    }

    const row = await prisma.platformSettings.findUnique({
      where: { id: PLATFORM_SETTINGS_ID },
      select: { subscriptionPlanName: true, subscriptionBillingCycles: true },
    })

    const plan = await createRazorpayPlan({
      amountPaise: input.amountPaise,
      currency: "INR",
      name: row?.subscriptionPlanName?.trim() || "Orvantaa Platform Subscription",
      description: "Orvantaa platform subscription — per student, monthly",
    })

    await prisma.platformSettings.update({
      where: { id: PLATFORM_SETTINGS_ID },
      data: { razorpayPlanId: plan.id },
    })
  }
}

export const subscriptionPlanService = new SubscriptionPlanService()
