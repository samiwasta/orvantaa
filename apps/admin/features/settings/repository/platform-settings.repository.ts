import { prisma } from "@/lib/db"

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

function buildDefaults(): PlatformSettingsData {
  const emailFrom = parseEmailFromEnv(process.env.EMAIL_FROM)
  const adminAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? ""
  const studentAppUrl =
    process.env.STUDENT_APP_URL?.trim() || adminAppUrl

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
  }
}

function mapRow(row: {
  platformName: string
  supportEmail: string
  billingEmail: string
  emailFromName: string
  emailFromAddress: string
  studentAppUrl: string
  adminAppUrl: string
  timezone: string
  sendStudentCredentialEmails: boolean
  sendSubscriptionEmails: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}): PlatformSettingsData {
  return {
    platformName: row.platformName,
    supportEmail: row.supportEmail,
    billingEmail: row.billingEmail,
    emailFromName: row.emailFromName,
    emailFromAddress: row.emailFromAddress,
    studentAppUrl: row.studentAppUrl,
    adminAppUrl: row.adminAppUrl,
    timezone: row.timezone,
    sendStudentCredentialEmails: row.sendStudentCredentialEmails,
    sendSubscriptionEmails: row.sendSubscriptionEmails,
    maintenanceMode: row.maintenanceMode,
    maintenanceMessage: row.maintenanceMessage,
  }
}

export class PlatformSettingsRepository {
  async getOrCreate(): Promise<PlatformSettingsData> {
    const defaults = buildDefaults()

    const row = await prisma.platformSettings.upsert({
      where: { id: PLATFORM_SETTINGS_ID },
      create: { id: PLATFORM_SETTINGS_ID, ...defaults },
      update: {},
    })

    return mapRow(row)
  }

  async save(input: PlatformSettingsInput): Promise<PlatformSettingsData> {
    const row = await prisma.platformSettings.upsert({
      where: { id: PLATFORM_SETTINGS_ID },
      create: { id: PLATFORM_SETTINGS_ID, ...input },
      update: input,
    })

    return mapRow(row)
  }
}

export const platformSettingsRepository = new PlatformSettingsRepository()
