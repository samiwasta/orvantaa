import { prisma } from "@/lib/db"

import {
  formatSchoolDisplayCode,
  parseSchoolRouteCode,
} from "../model/school-list-item"
import {
  formatRecurringDate,
  formatRecurringStatusLabel,
  mapPrismaRecurringStatus,
  type RecurringSubscriptionListItem,
} from "../model/recurring-subscription"
import { formatAmountLabel } from "../model/subscription-payment"

function mapRow(row: {
  id: string
  razorpaySubscriptionId: string
  status:
    | "CREATED"
    | "AUTHENTICATED"
    | "ACTIVE"
    | "PENDING"
    | "HALTED"
    | "CANCELLED"
    | "COMPLETED"
    | "EXPIRED"
  amountPaise: number
  principalAmountPaise: number
  studentCount: number
  currency: string
  planName: string
  authUrl: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  nextChargeAt: Date | null
  cancelledAt: Date | null
}): RecurringSubscriptionListItem {
  const status = mapPrismaRecurringStatus(row.status)
  return {
    id: row.id,
    razorpaySubscriptionId: row.razorpaySubscriptionId,
    status,
    statusLabel: formatRecurringStatusLabel(status),
    amountLabel: formatAmountLabel(row.amountPaise, row.currency) ?? "—",
    principalAmountLabel:
      row.principalAmountPaise > 0
        ? formatAmountLabel(row.principalAmountPaise, row.currency)
        : null,
    studentCount: row.studentCount,
    planName: row.planName,
    authUrl: row.authUrl,
    currentPeriodStart: formatRecurringDate(row.currentPeriodStart),
    currentPeriodEnd: formatRecurringDate(row.currentPeriodEnd),
    nextChargeAt: formatRecurringDate(row.nextChargeAt),
    cancelledAt: formatRecurringDate(row.cancelledAt),
  }
}

export class SchoolRecurringSubscriptionRepository {
  async findBillingSnapshotBySchoolId(schoolId: string): Promise<{
    id: string
    razorpaySubscriptionId: string
    status: RecurringSubscriptionListItem["status"]
    studentCount: number
    principalAmountPaise: number
    amountPaise: number
  } | null> {
    const row = await prisma.schoolRecurringSubscription.findUnique({
      where: { schoolId },
      select: {
        id: true,
        razorpaySubscriptionId: true,
        status: true,
        studentCount: true,
        principalAmountPaise: true,
        amountPaise: true,
      },
    })
    if (!row) return null
    return {
      id: row.id,
      razorpaySubscriptionId: row.razorpaySubscriptionId,
      status: mapPrismaRecurringStatus(row.status),
      studentCount: row.studentCount,
      principalAmountPaise: row.principalAmountPaise,
      amountPaise: row.amountPaise,
    }
  }

  async findCheckoutContextByRouteCode(routeCode: string): Promise<{
    schoolId: string
    schoolCode: string
    schoolName: string
    billingEmail: string | null
    subscription: {
      razorpaySubscriptionId: string
      status: RecurringSubscriptionListItem["status"]
      planName: string
      amountLabel: string
      statusLabel: string
    } | null
  } | null> {
    const normalized = parseSchoolRouteCode(routeCode)
    if (!normalized) return null

    const selection = {
      id: true,
      code: true,
      name: true,
      billingEmail: true,
      recurringSubscription: {
        select: {
          razorpaySubscriptionId: true,
          status: true,
          planName: true,
          amountPaise: true,
          currency: true,
        },
      },
    } as const

    let school = await prisma.school.findFirst({
      where: { code: { equals: normalized, mode: "insensitive" } },
      select: selection,
    })

    if (!school) {
      const upper = normalized.toUpperCase()
      const candidates = await prisma.school.findMany({
        select: selection,
      })
      school =
        candidates.find(
          (row) => formatSchoolDisplayCode(row.code, row.id) === upper
        ) ?? null
    }

    if (!school) return null

    const schoolCode = formatSchoolDisplayCode(school.code, school.id)
    const subscription = school.recurringSubscription

    return {
      schoolId: school.id,
      schoolCode,
      schoolName: school.name,
      billingEmail: school.billingEmail,
      subscription: subscription
        ? {
            razorpaySubscriptionId: subscription.razorpaySubscriptionId,
            status: mapPrismaRecurringStatus(subscription.status),
            planName: subscription.planName,
            amountLabel:
              formatAmountLabel(subscription.amountPaise, subscription.currency) ??
              "—",
            statusLabel: formatRecurringStatusLabel(
              mapPrismaRecurringStatus(subscription.status)
            ),
          }
        : null,
    }
  }

  async findSchoolRouteCodeById(schoolId: string): Promise<string | null> {
    const row = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, code: true },
    })
    if (!row) return null
    return formatSchoolDisplayCode(row.code, row.id)
  }

  async updateBillingSnapshot(
    schoolId: string,
    data: {
      studentCount: number
      principalAmountPaise: number
      amountPaise: number
    }
  ): Promise<void> {
    await prisma.schoolRecurringSubscription.update({
      where: { schoolId },
      data,
    })
  }

  async findCustomerIdBySchoolId(schoolId: string): Promise<string | null> {
    const row = await prisma.schoolRecurringSubscription.findUnique({
      where: { schoolId },
      select: { razorpayCustomerId: true },
    })
    return row?.razorpayCustomerId ?? null
  }

  async findBySchoolId(
    schoolId: string
  ): Promise<RecurringSubscriptionListItem | null> {
    const row = await prisma.schoolRecurringSubscription.findUnique({
      where: { schoolId },
    })
    return row ? mapRow(row) : null
  }

  async findByRazorpaySubscriptionId(
    razorpaySubscriptionId: string
  ): Promise<{ id: string; schoolId: string; status: string } | null> {
    const row = await prisma.schoolRecurringSubscription.findUnique({
      where: { razorpaySubscriptionId },
      select: { id: true, schoolId: true, status: true },
    })
    return row
  }

  async upsertFromRazorpay(input: {
    schoolId: string
    razorpaySubscriptionId: string
    razorpayPlanId: string
    razorpayCustomerId: string
    status:
      | "CREATED"
      | "AUTHENTICATED"
      | "ACTIVE"
      | "PENDING"
      | "HALTED"
      | "CANCELLED"
      | "COMPLETED"
      | "EXPIRED"
    amountPaise: number
    principalAmountPaise: number
    studentCount: number
    currency: string
    planName: string
    authUrl: string | null
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    nextChargeAt: Date | null
    cancelledAt: Date | null
  }): Promise<RecurringSubscriptionListItem> {
    const row = await prisma.schoolRecurringSubscription.upsert({
      where: { schoolId: input.schoolId },
      create: {
        schoolId: input.schoolId,
        razorpaySubscriptionId: input.razorpaySubscriptionId,
        razorpayPlanId: input.razorpayPlanId,
        razorpayCustomerId: input.razorpayCustomerId,
        status: input.status,
        amountPaise: input.amountPaise,
        principalAmountPaise: input.principalAmountPaise,
        studentCount: input.studentCount,
        currency: input.currency,
        planName: input.planName,
        authUrl: input.authUrl,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        nextChargeAt: input.nextChargeAt,
        cancelledAt: input.cancelledAt,
      },
      update: {
        razorpaySubscriptionId: input.razorpaySubscriptionId,
        razorpayPlanId: input.razorpayPlanId,
        razorpayCustomerId: input.razorpayCustomerId,
        status: input.status,
        amountPaise: input.amountPaise,
        principalAmountPaise: input.principalAmountPaise,
        studentCount: input.studentCount,
        currency: input.currency,
        planName: input.planName,
        authUrl: input.authUrl,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        nextChargeAt: input.nextChargeAt,
        cancelledAt: input.cancelledAt,
      },
    })

    return mapRow(row)
  }

  async updateByRazorpaySubscriptionId(
    razorpaySubscriptionId: string,
    data: {
      status?:
        | "CREATED"
        | "AUTHENTICATED"
        | "ACTIVE"
        | "PENDING"
        | "HALTED"
        | "CANCELLED"
        | "COMPLETED"
        | "EXPIRED"
      authUrl?: string | null
      currentPeriodStart?: Date | null
      currentPeriodEnd?: Date | null
      nextChargeAt?: Date | null
      cancelledAt?: Date | null
    }
  ): Promise<{ schoolId: string } | null> {
    try {
      const row = await prisma.schoolRecurringSubscription.update({
        where: { razorpaySubscriptionId },
        data,
        select: { schoolId: true },
      })
      return row
    } catch {
      return null
    }
  }
}

export const schoolRecurringSubscriptionRepository =
  new SchoolRecurringSubscriptionRepository()
