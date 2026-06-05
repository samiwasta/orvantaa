import {
  getRazorpayPaymentsClient,
  isRazorpayConfigured,
  parseRazorpayWebhookPayments,
  type RazorpayPaymentRecord,
} from "@/lib/payments/razorpay"

import {
  formatAmountLabel,
  formatTransactionDate,
  paymentStatusToEmailKind,
  type SubscriptionPaymentListItem,
  type SubscriptionPaymentsConfig,
} from "../model/subscription-payment"
import {
  type SchoolSubscriptionRepository,
  schoolSubscriptionRepository,
} from "../repository/school-subscription.repository"
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

    if (!options.sendEmail) return

    const emailKind = paymentStatusToEmailKind(upserted.status)
    if (!emailKind) return

    const context = await this.repository.findSchoolBillingContext(schoolId)
    if (!context) return

    const to = resolveBillingEmail(context.billingEmail)
    if (!to) return

    await this.emailService.sendPaymentNotification({
      to,
      schoolName: context.schoolName,
      kind: emailKind,
      transactionId: record.transactionId,
      serviceName: record.serviceName,
      amountLabel: formatAmountLabel(record.amountPaise, record.currency),
      transactionDate: formatTransactionDate(record.transactionDate),
      paymentMethod: record.paymentMethod,
      invoiceUrl: record.invoiceUrl,
    })
  }
}

export const schoolSubscriptionService = new SchoolSubscriptionService()
