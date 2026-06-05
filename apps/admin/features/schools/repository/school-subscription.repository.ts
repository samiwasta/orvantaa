import { prisma } from "@/lib/db"
import type { RazorpayPaymentRecord } from "@/lib/payments/razorpay"

import {
  formatAmountLabel,
  formatPaymentStatusLabel,
  formatTransactionDate,
  mapPaymentStatusToPrisma,
  mapPrismaPaymentStatus,
  type SubscriptionPaymentListItem,
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
  }
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

  async upsertPaymentFromRazorpay(
    schoolId: string,
    record: RazorpayPaymentRecord
  ): Promise<{ id: string; status: SubscriptionPaymentListItem["status"] }> {
    const status = mapPaymentStatusToPrisma(record.status)

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
      },
      select: { id: true, status: true },
    })

    return {
      id: row.id,
      status: mapPrismaPaymentStatus(row.status),
    }
  }
}

export const schoolSubscriptionRepository = new SchoolSubscriptionRepository()
