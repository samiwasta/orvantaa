import {
  cancelRazorpaySubscription,
  createRazorpayCustomer,
  createRazorpaySubscription,
  fetchRazorpaySubscription,
  parseRazorpaySubscriptionWebhook,
  schoolStatusFromRecurringStatus,
  subscriptionEntityToUpdate,
  updateRazorpaySubscriptionQuantity,
  type ParsedSubscriptionWebhook,
} from "@/lib/payments/razorpay"
import { platformSettingsRepository } from "@/features/settings/repository/platform-settings.repository"
import { subscriptionPlanService } from "@/features/settings/service/subscription-plan.service"

import {
  isRecurringSubscriptionLive,
  isRecurringSubscriptionTerminal,
  isRecurringSubscriptionUpdatable,
  mapPrismaRecurringStatus,
  type RecurringSubscriptionConfig,
  type RecurringSubscriptionListItem,
  type StartRecurringSubscriptionInput,
  type StartRecurringSubscriptionResult,
} from "../model/recurring-subscription"
import {
  formatAmountLabel,
  formatTransactionDate,
  type SubscriptionPaymentEmailKind,
} from "../model/subscription-payment"
import {
  type SchoolRecurringSubscriptionRepository,
  schoolRecurringSubscriptionRepository,
} from "../repository/school-recurring-subscription.repository"
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

export class SchoolRecurringSubscriptionService {
  constructor(
    private readonly repository: SchoolRecurringSubscriptionRepository = schoolRecurringSubscriptionRepository,
    private readonly paymentRepository: SchoolSubscriptionRepository = schoolSubscriptionRepository,
    private readonly emailService: SubscriptionPaymentEmailService = subscriptionPaymentEmailService
  ) {}

  async getRecurringConfig(): Promise<RecurringSubscriptionConfig> {
    const billing = await subscriptionPlanService.getBillingConfig()
    return {
      configured: billing.configured && billing.principalAmountPaise > 0,
      principalAmountPaise: billing.principalAmountPaise,
      principalAmountLabel:
        billing.principalAmountPaise > 0
          ? formatAmountLabel(billing.principalAmountPaise, "INR")
          : null,
      planName: billing.planName,
      autoStartEnabled: billing.autoStartEnabled,
    }
  }

  async getRecurringSubscription(
    schoolId: string
  ): Promise<RecurringSubscriptionListItem | null> {
    return this.repository.findBySchoolId(schoolId)
  }

  async startRecurringSubscription(
    schoolId: string,
    input: StartRecurringSubscriptionInput
  ): Promise<StartRecurringSubscriptionResult> {
    const existing = await this.repository.findBySchoolId(schoolId)
    if (existing && isRecurringSubscriptionLive(existing.status)) {
      throw new Error(
        "This school already has an active recurring subscription."
      )
    }

    const context = await this.paymentRepository.findSchoolBillingContext(schoolId)
    if (!context) {
      throw new Error("School not found.")
    }

    const billingEmail = resolveBillingEmail(context.billingEmail)
    if (!billingEmail) {
      throw new Error(
        "Add a billing email on the Management tab before starting a subscription."
      )
    }

    const plan = await subscriptionPlanService.ensurePlatformPlan()

    const studentCount = await this.paymentRepository.countStudentsForSchool(
      schoolId
    )
    if (studentCount <= 0) {
      throw new Error(
        "This school has no students yet. Add students before starting a subscription."
      )
    }

    const totalAmountPaise = plan.principalAmountPaise * studentCount

    const customer = await createRazorpayCustomer({
      name: context.schoolName,
      email: billingEmail,
      schoolId,
    })

    const subscription = await createRazorpaySubscription({
      planId: plan.planId,
      customerId: customer.id,
      schoolId,
      totalCount: plan.billingCycles,
      quantity: studentCount,
    })

    const update = subscriptionEntityToUpdate(subscription)

    const row = await this.repository.upsertFromRazorpay({
      schoolId,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: subscription.plan_id,
      razorpayCustomerId: subscription.customer_id,
      status: update.status,
      amountPaise: totalAmountPaise,
      principalAmountPaise: plan.principalAmountPaise,
      studentCount,
      currency: plan.currency,
      planName: plan.planName,
      authUrl: update.authUrl,
      currentPeriodStart: update.currentPeriodStart,
      currentPeriodEnd: update.currentPeriodEnd,
      nextChargeAt: update.nextChargeAt,
      cancelledAt: update.cancelledAt,
    })

    if (input.sendEmail && subscription.short_url) {
      await this.sendSetupEmailIfEnabled({
        to: billingEmail,
        schoolName: context.schoolName,
        authUrl: subscription.short_url,
        amountLabel: formatAmountLabel(totalAmountPaise, plan.currency),
        planName: plan.planName,
      })
    }

    return {
      authUrl: row.authUrl,
      razorpaySubscriptionId: row.razorpaySubscriptionId,
      status: row.status,
    }
  }

  async tryAutoStartForSchool(schoolId: string): Promise<void> {
    const billing = await subscriptionPlanService.getBillingConfig()
    if (!billing.autoStartEnabled || !billing.configured || billing.principalAmountPaise <= 0) {
      return
    }

    const studentCount = await this.paymentRepository.countStudentsForSchool(
      schoolId
    )
    if (studentCount <= 0) return

    const existing = await this.repository.findBySchoolId(schoolId)
    if (existing && isRecurringSubscriptionLive(existing.status)) return

    try {
      await this.startRecurringSubscription(schoolId, { sendEmail: true })
    } catch (error) {
      console.error(
        `[subscription] Auto-start failed for school ${schoolId}:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  async syncSubscriptionQuantityForSchool(schoolId: string): Promise<void> {
    const billing = await subscriptionPlanService.getBillingConfig()
    if (!billing.configured || billing.principalAmountPaise <= 0) return

    const snapshot = await this.repository.findBillingSnapshotBySchoolId(schoolId)
    const studentCount = await this.paymentRepository.countStudentsForSchool(
      schoolId
    )
    const principalAmountPaise = billing.principalAmountPaise
    const totalAmountPaise = principalAmountPaise * studentCount

    if (!snapshot) {
      if (studentCount > 0) {
        await this.tryAutoStartForSchool(schoolId)
      }
      return
    }

    if (isRecurringSubscriptionTerminal(snapshot.status)) {
      if (studentCount > 0) {
        await this.tryAutoStartForSchool(schoolId)
      }
      return
    }

    const billingChanged =
      snapshot.studentCount !== studentCount ||
      snapshot.principalAmountPaise !== principalAmountPaise ||
      snapshot.amountPaise !== totalAmountPaise

    if (billingChanged) {
      await this.repository.updateBillingSnapshot(schoolId, {
        studentCount,
        principalAmountPaise,
        amountPaise: totalAmountPaise,
      })
    }

    const previousStudentCount = snapshot.studentCount
    if (previousStudentCount === studentCount) return

    if (studentCount <= 0) {
      if (!isRecurringSubscriptionTerminal(snapshot.status)) {
        const entity = await cancelRazorpaySubscription(
          snapshot.razorpaySubscriptionId,
          { cancelAtCycleEnd: true }
        )
        const update = subscriptionEntityToUpdate(entity)
        await this.repository.updateByRazorpaySubscriptionId(
          snapshot.razorpaySubscriptionId,
          update
        )
        await this.paymentRepository.updateSchoolSubscriptionStatus(
          schoolId,
          "inactive"
        )
      }
      return
    }

    if (!isRecurringSubscriptionUpdatable(snapshot.status)) return

    const scheduleChangeAt =
      studentCount > previousStudentCount ? "now" : "cycle_end"

    const entity = await updateRazorpaySubscriptionQuantity({
      subscriptionId: snapshot.razorpaySubscriptionId,
      quantity: studentCount,
      scheduleChangeAt,
    })

    const update = subscriptionEntityToUpdate(entity)
    await this.repository.updateByRazorpaySubscriptionId(
      snapshot.razorpaySubscriptionId,
      update
    )
  }

  async cancelRecurringSubscription(schoolId: string): Promise<void> {
    const existing = await this.repository.findBySchoolId(schoolId)
    if (!existing) {
      throw new Error("No recurring subscription found for this school.")
    }

    if (
      existing.status === "cancelled" ||
      existing.status === "completed" ||
      existing.status === "expired"
    ) {
      return
    }

    const entity = await cancelRazorpaySubscription(
      existing.razorpaySubscriptionId
    )
    const update = subscriptionEntityToUpdate(entity)

    await this.repository.updateByRazorpaySubscriptionId(
      existing.razorpaySubscriptionId,
      update
    )

    await this.paymentRepository.updateSchoolSubscriptionStatus(
      schoolId,
      "inactive"
    )
  }

  async syncRecurringSubscription(schoolId: string): Promise<void> {
    const existing = await this.repository.findBySchoolId(schoolId)
    if (!existing) {
      throw new Error("No recurring subscription found for this school.")
    }

    await this.syncSubscriptionQuantityForSchool(schoolId)

    const snapshot = await this.repository.findBillingSnapshotBySchoolId(
      schoolId
    )
    if (!snapshot || isRecurringSubscriptionTerminal(snapshot.status)) {
      return
    }

    const entity = await fetchRazorpaySubscription(
      snapshot.razorpaySubscriptionId
    )
    await this.applySubscriptionEntity(schoolId, entity, { sendEmail: false })
  }

  async handleSubscriptionWebhook(body: unknown): Promise<number> {
    const parsed = parseRazorpaySubscriptionWebhook(body)
    if (!parsed) return 0

    await this.processSubscriptionWebhook(parsed, { sendEmail: true })
    return 1
  }

  private async processSubscriptionWebhook(
    parsed: ParsedSubscriptionWebhook,
    options: { sendEmail: boolean }
  ): Promise<void> {
    const schoolId =
      parsed.schoolId ??
      (
        await this.repository.findByRazorpaySubscriptionId(
          parsed.subscription.id
        )
      )?.schoolId

    if (!schoolId) return

    await this.applySubscriptionEntity(schoolId, parsed.subscription, options)

    if (parsed.payment) {
      await this.paymentRepository.upsertPaymentFromRazorpay(schoolId, {
        ...parsed.payment,
        schoolId,
        serviceName:
          parsed.payment.serviceName || "Orvantaa Platform Subscription",
      })

      if (parsed.payment.status === "success") {
        await this.paymentRepository.updateSchoolSubscriptionStatus(
          schoolId,
          "active"
        )
      }

      if (options.sendEmail && parsed.payment.status === "success") {
        const context =
          await this.paymentRepository.findSchoolBillingContext(schoolId)
        const to = context
          ? resolveBillingEmail(context.billingEmail)
          : null
        if (context && to) {
          await this.sendPaymentEmailIfEnabled({
            to,
            schoolName: context.schoolName,
            kind: "success",
            transactionId: parsed.payment.transactionId,
            serviceName: parsed.payment.serviceName,
            amountLabel: formatAmountLabel(
              parsed.payment.amountPaise,
              parsed.payment.currency
            ),
            transactionDate: formatTransactionDate(parsed.payment.transactionDate),
            paymentMethod: parsed.payment.paymentMethod,
            paymentUrl: null,
            invoiceUrl: parsed.payment.invoiceUrl,
          })
        }
      }
    }
  }

  private async applySubscriptionEntity(
    schoolId: string,
    entity: ParsedSubscriptionWebhook["subscription"],
    _options: { sendEmail: boolean }
  ): Promise<void> {
    const update = subscriptionEntityToUpdate(entity)
    const updated = await this.repository.updateByRazorpaySubscriptionId(
      entity.id,
      update
    )

    if (!updated) {
      const billing = await subscriptionPlanService.getBillingConfig()
      const studentCount =
        await this.paymentRepository.countStudentsForSchool(schoolId)
      const principalAmountPaise = billing.principalAmountPaise
      await this.repository.upsertFromRazorpay({
        schoolId,
        razorpaySubscriptionId: entity.id,
        razorpayPlanId: entity.plan_id,
        razorpayCustomerId: entity.customer_id,
        status: update.status,
        amountPaise: principalAmountPaise * Math.max(studentCount, 1),
        principalAmountPaise,
        studentCount,
        currency: "INR",
        planName: billing.planName,
        authUrl: update.authUrl,
        currentPeriodStart: update.currentPeriodStart,
        currentPeriodEnd: update.currentPeriodEnd,
        nextChargeAt: update.nextChargeAt,
        cancelledAt: update.cancelledAt,
      })
    }

    const schoolStatus = schoolStatusFromRecurringStatus(update.status)
    if (schoolStatus) {
      await this.paymentRepository.updateSchoolSubscriptionStatus(
        schoolId,
        schoolStatus
      )
    }

    if (
      isRecurringSubscriptionUpdatable(mapPrismaRecurringStatus(update.status))
    ) {
      try {
        await this.syncSubscriptionQuantityForSchool(schoolId)
      } catch (error) {
        console.error(
          `[subscription] Quantity sync failed for school ${schoolId}:`,
          error instanceof Error ? error.message : error
        )
      }
    }
  }

  private async sendSetupEmailIfEnabled(payload: {
    to: string
    schoolName: string
    authUrl: string
    amountLabel: string | null
    planName: string
  }): Promise<void> {
    const settings = await platformSettingsRepository.getOrCreate()
    if (!settings.sendSubscriptionEmails) return

    await this.emailService.sendPaymentNotification({
      to: payload.to,
      schoolName: payload.schoolName,
      kind: "setup",
      transactionId: payload.authUrl,
      serviceName: payload.planName,
      amountLabel: payload.amountLabel,
      transactionDate: formatTransactionDate(new Date()),
      paymentMethod: null,
      paymentUrl: payload.authUrl,
      invoiceUrl: null,
    })
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
    paymentUrl: string | null
    invoiceUrl: string | null
  }): Promise<void> {
    const settings = await platformSettingsRepository.getOrCreate()
    if (!settings.sendSubscriptionEmails) return

    await this.emailService.sendPaymentNotification(payload)
  }
}

export const schoolRecurringSubscriptionService =
  new SchoolRecurringSubscriptionService()
