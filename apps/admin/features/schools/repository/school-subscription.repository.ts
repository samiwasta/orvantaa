import type { SchoolSubscriptionStatus as PrismaSchoolSubscriptionStatus } from "@/lib/generated/prisma"

import { prisma } from "@/lib/db"
import type { RazorpayPaymentRecord } from "@/lib/payments/razorpay"

import {
  mapSubscriptionStatusToPrisma,
  type SchoolSubscriptionStatus,
} from "../model/school-list-item"
import {
  formatAmountLabel,
  formatPaymentStatusLabel,
  formatTransactionDate,
  mapPaymentStatusToPrisma,
  mapPrismaPaymentStatus,
  type SubscriptionPaymentListItem,
  type SubscriptionPaymentStatus,
} from "../model/subscription-payment"

function mapRow(row: {
  id: string
  transactionId: string
  transactionDate: Date
  serviceName: string
  paymentMethod: string | null
  amountPaise: number | null
  currency: string
  status: "DUE" | "SUCCESS" | "FAILED" | "LATE" | "PENDING"
  invoiceUrl: string | null
  paymentUrl: string | null
}): SubscriptionPaymentListItem {
  const status = mapPrismaPaymentStatus(row.status)
  return {
    id: row.id,
    transactionId: row.transactionId,
    transactionDate: formatTransactionDate(row.transactionDate),
    transactionDateIso: row.transactionDate.toISOString(),
    serviceName: row.serviceName,
    paymentMethod: row.paymentMethod,
    amountLabel: formatAmountLabel(row.amountPaise, row.currency),
    status,
    statusLabel: formatPaymentStatusLabel(status),
    invoiceUrl: row.invoiceUrl,
    paymentUrl: row.paymentUrl,
  }
}

export type UpsertPaymentResult = {
  id: string
  status: SubscriptionPaymentStatus
  previousStatus: SubscriptionPaymentStatus | null
  emailSentAt: Date | null
  paymentUrl: string | null
}

export class SchoolSubscriptionRepository {
  async findPaymentsBySchoolId(
    schoolId: string
  ): Promise<SubscriptionPaymentListItem[]> {
    const rows = await prisma.schoolSubscriptionPayment.findMany({
      where: { schoolId },
      orderBy: { transactionDate: "desc" },
      select: {
        id: true,
        transactionId: true,
        transactionDate: true,
        serviceName: true,
        paymentMethod: true,
        amountPaise: true,
        currency: true,
        status: true,
        invoiceUrl: true,
        paymentUrl: true,
      },
    })

    return rows.map(mapRow)
  }

  async findSchoolBillingContext(schoolId: string): Promise<{
    schoolName: string
    billingEmail: string | null
  } | null> {
    const row = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, billingEmail: true },
    })
    if (!row) return null
    return { schoolName: row.name, billingEmail: row.billingEmail }
  }

  async countStudentsForSchool(schoolId: string): Promise<number> {
    return prisma.user.count({
      where: {
        role: "STUDENT",
        section: {
          class: { schoolId },
        },
      },
    })
  }

  async upsertPaymentFromRazorpay(
    schoolId: string,
    record: RazorpayPaymentRecord
  ): Promise<UpsertPaymentResult> {
    const status = mapPaymentStatusToPrisma(record.status)
    const existing = await prisma.schoolSubscriptionPayment.findUnique({
      where: { transactionId: record.transactionId },
      select: { status: true, emailSentAt: true, paymentUrl: true },
    })

    const row = await prisma.schoolSubscriptionPayment.upsert({
      where: { transactionId: record.transactionId },
      create: {
        schoolId,
        transactionId: record.transactionId,
        razorpayOrderId: record.razorpayOrderId,
        razorpayPaymentId: record.razorpayPaymentId,
        transactionDate: record.transactionDate,
        serviceName: record.serviceName,
        paymentMethod: record.paymentMethod,
        amountPaise: record.amountPaise,
        currency: record.currency,
        status,
        invoiceUrl: record.invoiceUrl,
        paymentUrl: record.paymentUrl ?? null,
      },
      update: {
        razorpayOrderId: record.razorpayOrderId,
        razorpayPaymentId: record.razorpayPaymentId,
        transactionDate: record.transactionDate,
        serviceName: record.serviceName,
        paymentMethod: record.paymentMethod,
        amountPaise: record.amountPaise,
        currency: record.currency,
        status,
        invoiceUrl: record.invoiceUrl,
        paymentUrl: record.paymentUrl ?? undefined,
      },
      select: {
        id: true,
        status: true,
        emailSentAt: true,
        paymentUrl: true,
      },
    })

    return {
      id: row.id,
      status: mapPrismaPaymentStatus(row.status),
      previousStatus: existing
        ? mapPrismaPaymentStatus(existing.status)
        : null,
      emailSentAt: row.emailSentAt,
      paymentUrl: row.paymentUrl,
    }
  }

  async createDuePaymentLink(input: {
    schoolId: string
    transactionId: string
    serviceName: string
    amountPaise: number
    currency: string
    paymentUrl: string
  }): Promise<{ id: string }> {
    return prisma.schoolSubscriptionPayment.create({
      data: {
        schoolId: input.schoolId,
        transactionId: input.transactionId,
        transactionDate: new Date(),
        serviceName: input.serviceName,
        amountPaise: input.amountPaise,
        currency: input.currency,
        status: "DUE",
        paymentUrl: input.paymentUrl,
      },
      select: { id: true },
    })
  }

  async markEmailSent(paymentId: string): Promise<void> {
    await prisma.schoolSubscriptionPayment.update({
      where: { id: paymentId },
      data: { emailSentAt: new Date() },
    })
  }

  async updateSchoolSubscriptionStatus(
    schoolId: string,
    status: SchoolSubscriptionStatus
  ): Promise<void> {
    await prisma.school.update({
      where: { id: schoolId },
      data: {
        subscriptionStatus: mapSubscriptionStatusToPrisma(
          status
        ) as PrismaSchoolSubscriptionStatus,
      },
    })
  }
}

export const schoolSubscriptionRepository = new SchoolSubscriptionRepository()
