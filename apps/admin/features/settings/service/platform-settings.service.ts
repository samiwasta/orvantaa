import { getRazorpayConfig } from "@/lib/payments/razorpay/config"

import type {
  IntegrationStatus,
  PlatformSettingsData,
  PlatformSettingsInput,
} from "../model/platform-settings"
import { platformSettingsRepository } from "../repository/platform-settings.repository"
import { subscriptionPlanService } from "./subscription-plan.service"

export class PlatformSettingsService {
  async getSettings(): Promise<PlatformSettingsData> {
    return platformSettingsRepository.getOrCreate()
  }

  async saveSettings(input: PlatformSettingsInput): Promise<PlatformSettingsData> {
    const { settings, previousAmountPaise } =
      await platformSettingsRepository.save(input)

    await subscriptionPlanService.refreshPlatformPlanIfNeeded({
      amountPaise: Math.round(input.subscriptionPrincipalAmountRupees * 100),
      previousAmountPaise,
    })

    return settings
  }

  getIntegrationStatus(): IntegrationStatus {
    const emailProvider = (process.env.EMAIL_PROVIDER ?? "resend").trim()
    const resendConfigured = Boolean(process.env.RESEND_API_KEY?.trim())
    const emailConfigured =
      emailProvider === "ses" ? true : resendConfigured

    const razorpay = getRazorpayConfig()
    const r2Configured = Boolean(
      process.env.R2_ACCOUNT_ID?.trim() &&
        process.env.R2_ACCESS_KEY_ID?.trim() &&
        process.env.R2_SECRET_ACCESS_KEY?.trim() &&
        process.env.R2_BUCKET_NAME?.trim()
    )

    const sessionSeconds = Number.parseInt(
      process.env.JWT_EXPIRES_IN_SECONDS ?? "604800",
      10
    )
    const sessionDays = Number.isFinite(sessionSeconds)
      ? Math.max(1, Math.round(sessionSeconds / 86400))
      : 7

    const emailFrom =
      process.env.EMAIL_FROM?.trim() || "Orvantaa <noreply@orvantaa.com>"

    return {
      email: {
        provider: emailProvider,
        configured: emailConfigured,
        fromAddress: emailFrom,
      },
      razorpay: {
        enabled: razorpay.enabled,
        webhookConfigured: Boolean(razorpay.webhookSecret),
      },
      storage: {
        configured: r2Configured,
        publicUrl: process.env.R2_PUBLIC_URL?.trim() || null,
      },
      auth: {
        sessionDays,
      },
    }
  }
}

export const platformSettingsService = new PlatformSettingsService()
