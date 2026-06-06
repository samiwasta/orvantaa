import { z } from "zod"

export const PLATFORM_SETTINGS_ID = "platform"

export type PlatformSettingsData = {
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
  subscriptionPrincipalAmountRupees: number
  subscriptionPlanName: string
  subscriptionBillingCycles: number
  autoStartSchoolSubscriptions: boolean
}

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "Gulf (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Europe/London", label: "United Kingdom (GMT/BST)" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "UTC", label: "UTC" },
] as const

export const platformSettingsSchema = z
  .object({
    platformName: z
      .string()
      .trim()
      .min(1, "Platform name is required")
      .max(80, "Platform name is too long"),
    supportEmail: z
      .string()
      .trim()
      .email("Enter a valid support email")
      .or(z.literal("")),
    billingEmail: z
      .string()
      .trim()
      .email("Enter a valid billing email")
      .or(z.literal("")),
    emailFromName: z
      .string()
      .trim()
      .min(1, "Sender name is required")
      .max(80, "Sender name is too long"),
    emailFromAddress: z
      .string()
      .trim()
      .email("Enter a valid sender email")
      .or(z.literal("")),
    studentAppUrl: z
      .string()
      .trim()
      .url("Enter a valid student app URL")
      .or(z.literal("")),
    adminAppUrl: z
      .string()
      .trim()
      .url("Enter a valid admin app URL")
      .or(z.literal("")),
    timezone: z.string().min(1, "Select a timezone"),
    sendStudentCredentialEmails: z.boolean(),
    sendSubscriptionEmails: z.boolean(),
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().trim().max(500, "Message is too long"),
    subscriptionPrincipalAmountRupees: z.coerce
      .number({ invalid_type_error: "Enter a valid amount" })
      .min(0, "Amount cannot be negative")
      .max(1_000_000, "Amount is too large"),
    subscriptionPlanName: z
      .string()
      .trim()
      .min(1, "Plan name is required")
      .max(120, "Plan name is too long"),
    subscriptionBillingCycles: z.coerce
      .number({ invalid_type_error: "Enter a valid number of cycles" })
      .int("Billing cycles must be a whole number")
      .min(1, "At least one billing cycle is required")
      .max(999, "Too many billing cycles"),
    autoStartSchoolSubscriptions: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.maintenanceMode && !data.maintenanceMessage.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add a message when maintenance mode is enabled",
        path: ["maintenanceMessage"],
      })
    }
  })

export type PlatformSettingsInput = z.infer<typeof platformSettingsSchema>

export type IntegrationStatus = {
  email: {
    provider: string
    configured: boolean
    fromAddress: string
  }
  razorpay: {
    enabled: boolean
    webhookConfigured: boolean
  }
  storage: {
    configured: boolean
    publicUrl: string | null
  }
  auth: {
    sessionDays: number
  }
}
