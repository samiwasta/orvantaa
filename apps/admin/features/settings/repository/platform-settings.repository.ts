import { prisma } from "@/lib/db"
import { getAdminAppUrl, getStudentAppUrl } from "@/lib/app-urls"

import {
  PLATFORM_SETTINGS_ID,
  type PlatformSettingsData,
  type PlatformSettingsInput,
} from "../model/platform-settings"

function parseEmailFromEnv(value: string | undefined): {
  name: string
  address: string
} {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return { name: "Orvantaa", address: "" }

  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/)
  if (match?.[1] && match[2]) {
    return { name: match[1].trim(), address: match[2].trim() }
  }
  return { name: "Orvantaa", address: trimmed }
}

function buildDbDefaults() {
  const emailFrom = parseEmailFromEnv(process.env.EMAIL_FROM)
  const adminAppUrl = getAdminAppUrl()
  const studentAppUrl = getStudentAppUrl()

  return {
    platformName: "Orvantaa",
    supportEmail: "",
    billingEmail: process.env.SUBSCRIPTION_BILLING_EMAIL?.trim() ?? "",
    emailFromName: emailFrom.name,
    emailFromAddress: emailFrom.address,
    studentAppUrl,
    adminAppUrl,
    timezone: "Asia/Kolkata",
    sendStudentCredentialEmails: true,
    sendSubscriptionEmails: true,
    maintenanceMode: false,
    maintenanceMessage: "",
    subscriptionPrincipalAmountPaise: 0,
    subscriptionPlanName: "Orvantaa Platform Subscription",
    subscriptionBillingCycles: 120,
    autoStartSchoolSubscriptions: true,
  }
}

function mapRow(row: {
  platformName: string
  supportEmail: string
  billingEmail?: string
  emailFromName: string
  emailFromAddress: string
  studentAppUrl: string
  adminAppUrl: string
  timezone: string
  sendStudentCredentialEmails: boolean
  sendSubscriptionEmails: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  subscriptionPrincipalAmountPaise: number
  subscriptionPlanName: string
  subscriptionBillingCycles: number
  autoStartSchoolSubscriptions: boolean
}): PlatformSettingsData {
  return {
    platformName: row.platformName,
    supportEmail: row.supportEmail,
    billingEmail: row.billingEmail ?? "",
    emailFromName: row.emailFromName,
    emailFromAddress: row.emailFromAddress,
    studentAppUrl: row.studentAppUrl,
    adminAppUrl: row.adminAppUrl,
    timezone: row.timezone,
    sendStudentCredentialEmails: row.sendStudentCredentialEmails,
    sendSubscriptionEmails: row.sendSubscriptionEmails,
    maintenanceMode: row.maintenanceMode,
    maintenanceMessage: row.maintenanceMessage,
    subscriptionPrincipalAmountRupees: row.subscriptionPrincipalAmountPaise / 100,
    subscriptionPlanName: row.subscriptionPlanName,
    subscriptionBillingCycles: row.subscriptionBillingCycles,
    autoStartSchoolSubscriptions: row.autoStartSchoolSubscriptions,
  }
}

function toDbInput(input: PlatformSettingsInput) {
  return {
    platformName: input.platformName,
    supportEmail: input.supportEmail,
    billingEmail: input.billingEmail,
    emailFromName: input.emailFromName,
    emailFromAddress: input.emailFromAddress,
    studentAppUrl: input.studentAppUrl,
    adminAppUrl: input.adminAppUrl,
    timezone: input.timezone,
    sendStudentCredentialEmails: input.sendStudentCredentialEmails,
    sendSubscriptionEmails: input.sendSubscriptionEmails,
    maintenanceMode: input.maintenanceMode,
    maintenanceMessage: input.maintenanceMessage,
    subscriptionPrincipalAmountPaise: Math.round(
      input.subscriptionPrincipalAmountRupees * 100
    ),
    subscriptionPlanName: input.subscriptionPlanName,
    subscriptionBillingCycles: input.subscriptionBillingCycles,
    autoStartSchoolSubscriptions: input.autoStartSchoolSubscriptions,
  }
}

export class PlatformSettingsRepository {
  async getOrCreate(): Promise<PlatformSettingsData> {
    const defaults = buildDbDefaults()

    const row = await prisma.platformSettings.upsert({
      where: { id: PLATFORM_SETTINGS_ID },
      create: { id: PLATFORM_SETTINGS_ID, ...defaults },
      update: {},
    })

    return mapRow(row)
  }

  async getRawAmountPaise(): Promise<number> {
    const row = await prisma.platformSettings.findUnique({
      where: { id: PLATFORM_SETTINGS_ID },
      select: { subscriptionPrincipalAmountPaise: true },
    })
    return row?.subscriptionPrincipalAmountPaise ?? 0
  }

  async save(input: PlatformSettingsInput): Promise<{
    settings: PlatformSettingsData
    previousAmountPaise: number
  }> {
    const previousAmountPaise = await this.getRawAmountPaise()
    const data = toDbInput(input)

    const row = await prisma.platformSettings.upsert({
      where: { id: PLATFORM_SETTINGS_ID },
      create: { id: PLATFORM_SETTINGS_ID, ...data },
      update: data,
    })

    return {
      settings: mapRow(row),
      previousAmountPaise,
    }
  }
}

export const platformSettingsRepository = new PlatformSettingsRepository()
