import { render } from "@react-email/render"
import _SubscriptionPaymentEmail from "@workspace/transactional/emails/subscription-payment"

import { getAdminAppUrl } from "@/lib/app-urls"
import { type EmailProvider, emailProvider } from "@/lib/email"

import type { SubscriptionPaymentEmailKind } from "../model/subscription-payment"

const SubscriptionPaymentEmail: typeof _SubscriptionPaymentEmail =
  typeof _SubscriptionPaymentEmail === "function"
    ? _SubscriptionPaymentEmail
    : (_SubscriptionPaymentEmail as { default: typeof _SubscriptionPaymentEmail })
        .default

function portalUrl(): string {
  return getAdminAppUrl()
}

const subjects: Record<SubscriptionPaymentEmailKind, string> = {
  due: "Orvantaa subscription payment due",
  success: "Orvantaa subscription payment received",
  failed: "Orvantaa subscription payment failed",
  late: "Orvantaa subscription payment overdue",
}

export type SubscriptionPaymentEmailPayload = {
  to: string
  schoolName: string
  kind: SubscriptionPaymentEmailKind
  transactionId: string
  serviceName: string
  amountLabel: string | null
  transactionDate: string
  paymentMethod: string | null
  invoiceUrl: string | null
}

export class SubscriptionPaymentEmailService {
  constructor(private readonly provider: EmailProvider = emailProvider) {}

  async sendPaymentNotification(
    payload: SubscriptionPaymentEmailPayload
  ): Promise<void> {
    const html = await render(
      SubscriptionPaymentEmail({
        schoolName: payload.schoolName,
        kind: payload.kind,
        transactionId: payload.transactionId,
        serviceName: payload.serviceName,
        amountLabel: payload.amountLabel,
        transactionDate: payload.transactionDate,
        paymentMethod: payload.paymentMethod,
        invoiceUrl: payload.invoiceUrl,
        portalUrl: portalUrl(),
      })
    )

    await this.provider.send({
      to: payload.to,
      subject: subjects[payload.kind],
      html,
    })
  }
}

export const subscriptionPaymentEmailService =
  new SubscriptionPaymentEmailService()
