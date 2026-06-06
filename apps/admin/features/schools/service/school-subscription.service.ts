import { randomBytes } from "crypto"

import {
  createRazorpayPaymentLink,
  getRazorpayPaymentsClient,
  isRazorpayConfigured,
  parseRazorpayWebhookPayments,
  type RazorpayPaymentRecord,
} from "@/lib/payments/razorpay"
import { platformSettingsRepository } from "@/features/settings/repository/platform-settings.repository"

import {
  formatAmountLabel,
  formatTransactionDate,
  paymentStatusToEmailKind,
  type CreateSubscriptionPaymentLinkInput,
  type CreateSubscriptionPaymentLinkResult,
  type SubscriptionPaymentEmailKind,
  type SubscriptionPaymentListItem,
  type SubscriptionPaymentsConfig,
} from "../model/subscription-payment"
import {
  type SchoolSubscriptionRepository,
  schoolSubscriptionRepository,
} from "../repository/school-subscription.repository"
import { subscriptionStatusFromPayment } from "./subscription-status-rules"
import { schoolRecurringSubscriptionService } from "./school-recurring-subscription.service"
import {
  type SubscriptionPaymentEmailService,
  subscriptionPaymentEmailService,
} from "./subscription-payment-email.service"

function resolveBillingEmail(
  schoolBillingEmail: string | null
): string | null {
  const schoolEmail = schoolBillingEmail?.trim()
  if (schoolEmail) return schoolEmail

  const fallback =
    process.env.SUBSCRIPTION_BILLING_EMAIL?.trim() ??
    process.env.SCHOOL_BILLING_FALLBACK_EMAIL?.trim()

  return fallback || null
}

export class SchoolSubscriptionService {
  constructor(
    private readonly repository: SchoolSubscriptionRepository = schoolSubscriptionRepository,
    private readonly emailService: SubscriptionPaymentEmailService = subscriptionPaymentEmailService
  ) {}

  getPaymentsConfig(): SubscriptionPaymentsConfig {
    const configured = isRazorpayConfigured()
    return {
      razorpayConfigured: configured,
      razorpayEnabled: configured,
    }
  }

  async listPayments(schoolId: string): Promise<SubscriptionPaymentListItem[]> {
    return this.repository.findPaymentsBySchoolId(schoolId)
  }

  async createPaymentLink(
    schoolId: string,
    input: CreateSubscriptionPaymentLinkInput
  ): Promise<CreateSubscriptionPaymentLinkResult> {
    const context = await this.repository.findSchoolBillingContext(schoolId)
    if (!context) {
      throw new Error("School not found.")
    }

    const amountPaise = Math.round(input.amountRupees * 100)
    const referenceId = randomBytes(12).toString("hex")
    const serviceName = input.serviceName.trim()

    const link = await createRazorpayPaymentLink({
      amountPaise,
      currency: "INR",
      description: `${serviceName} — ${context.schoolName}`,
      schoolId,
      schoolName: context.schoolName,
      serviceName,
      customerEmail: context.billingEmail,
      customerName: context.schoolName,
      referenceId,
    })

    const paymentRow = await this.repository.createDuePaymentLink({
      schoolId,
      transactionId: link.paymentLinkId,
      serviceName,
      amountPaise,
      currency: "INR",
      paymentUrl: link.shortUrl,
    })

    await this.repository.updateSchoolSubscriptionStatus(schoolId, "inactive")

    if (input.sendEmail) {
      const to = resolveBillingEmail(context.billingEmail)
      if (to) {
        const sent = await this.sendPaymentEmailIfEnabled({
          to,
          schoolName: context.schoolName,
          kind: "due",
          transactionId: link.paymentLinkId,
          serviceName,
          amountLabel: formatAmountLabel(amountPaise, "INR"),
          transactionDate: formatTransactionDate(new Date()),
          paymentMethod: null,
          paymentUrl: link.shortUrl,
        })
        if (sent) {
          await this.repository.markEmailSent(paymentRow.id)
        }
      }
    }

    return {
      paymentUrl: link.shortUrl,
      transactionId: link.paymentLinkId,
    }
  }

  async syncPaymentsFromRazorpay(schoolId: string): Promise<number> {
    const client = getRazorpayPaymentsClient()
    if (!client.isConfigured()) {
      throw new Error(
        "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment."
      )
    }

    const records = await client.fetchPaymentsForSchool(schoolId)
    let synced = 0

    for (const record of records) {
      await this.ingestPayment(schoolId, record, { sendEmail: false })
      synced += 1
    }

    return synced
  }

  async handleRazorpayWebhook(body: unknown): Promise<number> {
    const subscriptionProcessed =
      await schoolRecurringSubscriptionService.handleSubscriptionWebhook(body)
    if (subscriptionProcessed > 0) {
      return subscriptionProcessed
    }

    const records = parseRazorpayWebhookPayments(body)
    let processed = 0

    for (const record of records) {
      const schoolId = record.schoolId
      if (!schoolId) continue
      await this.ingestPayment(schoolId, record, { sendEmail: true })
      processed += 1
    }

    return processed
  }

  private async ingestPayment(
    schoolId: string,
    record: RazorpayPaymentRecord,
    options: { sendEmail: boolean }
  ): Promise<void> {
    const upserted = await this.repository.upsertPaymentFromRazorpay(schoolId, {
      ...record,
      schoolId,
    })

    const nextStatus = subscriptionStatusFromPayment(upserted.status)
    if (
      nextStatus &&
      (upserted.previousStatus !== upserted.status || !upserted.previousStatus)
    ) {
      await this.repository.updateSchoolSubscriptionStatus(schoolId, nextStatus)
    }

    if (!options.sendEmail) return

    const emailKind = paymentStatusToEmailKind(upserted.status)
    if (!emailKind) return

    if (
      upserted.previousStatus === upserted.status &&
      upserted.emailSentAt
    ) {
      return
    }

    const context = await this.repository.findSchoolBillingContext(schoolId)
    if (!context) return

    const to = resolveBillingEmail(context.billingEmail)
    if (!to) return

    const sent = await this.sendPaymentEmailIfEnabled({
      to,
      schoolName: context.schoolName,
      kind: emailKind,
      transactionId: record.transactionId,
      serviceName: record.serviceName,
      amountLabel: formatAmountLabel(record.amountPaise, record.currency),
      transactionDate: formatTransactionDate(record.transactionDate),
      paymentMethod: record.paymentMethod,
      paymentUrl: upserted.paymentUrl ?? record.paymentUrl ?? null,
      invoiceUrl: record.invoiceUrl,
    })

    if (sent) {
      await this.repository.markEmailSent(upserted.id)
    }
  }

  private async sendPaymentEmailIfEnabled(payload: {
    to: string
    schoolName: string
    kind: SubscriptionPaymentEmailKind
    transactionId: string
    serviceName: string
    amountLabel: string | null
    transactionDate: string
    paymentMethod: string | null
    paymentUrl?: string | null
    invoiceUrl?: string | null
  }): Promise<boolean> {
    const settings = await platformSettingsRepository.getOrCreate()
    if (!settings.sendSubscriptionEmails) {
      return false
    }

    await this.emailService.sendPaymentNotification({
      to: payload.to,
      schoolName: payload.schoolName,
      kind: payload.kind,
      transactionId: payload.transactionId,
      serviceName: payload.serviceName,
      amountLabel: payload.amountLabel,
      transactionDate: payload.transactionDate,
      paymentMethod: payload.paymentMethod,
      paymentUrl: payload.paymentUrl ?? null,
      invoiceUrl: payload.invoiceUrl ?? null,
    })

    return true
  }
}

export const schoolSubscriptionService = new SchoolSubscriptionService()
