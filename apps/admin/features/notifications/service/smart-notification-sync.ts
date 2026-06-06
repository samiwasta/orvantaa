import {
  formatSchoolDisplayCode,
  formatSubscriptionLabel,
  mapPrismaSubscriptionStatus,
  schoolDetailHref,
} from "@/features/schools/model/school-list-item"
import {
  formatAmountLabel,
  formatPaymentStatusLabel,
  mapPrismaPaymentStatus,
} from "@/features/schools/model/subscription-payment"
import { prisma } from "@/lib/db"

import type { UpsertNotificationInput } from "../model/notification"
import { notificationRepository } from "../repository/notification.repository"

function subscriptionTabHref(schoolCode: string): string {
  return `${schoolDetailHref(schoolCode)}?tab=subscription`
}

export async function syncSmartNotifications(): Promise<void> {
  const activeDedupeKeys: string[] = []
  const upserts: UpsertNotificationInput[] = []

  const [
    schoolsWithIssues,
    actionablePayments,
    unassignedStudents,
    platformSettings,
  ] = await Promise.all([
    prisma.school.findMany({
      where: {
        subscriptionStatus: { not: "ACTIVE" },
      },
      select: {
        id: true,
        name: true,
        code: true,
        subscriptionStatus: true,
      },
    }),
    prisma.schoolSubscriptionPayment.findMany({
      where: {
        status: { in: ["FAILED", "DUE", "LATE"] },
      },
      orderBy: { transactionDate: "desc" },
      take: 20,
      select: {
        id: true,
        transactionId: true,
        serviceName: true,
        amountPaise: true,
        currency: true,
        status: true,
        transactionDate: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    }),
    prisma.user.count({
      where: { role: "STUDENT", sectionId: null },
    }),
    prisma.platformSettings.findUnique({
      where: { id: "platform" },
      select: { maintenanceMode: true, maintenanceMessage: true },
    }),
  ])

  for (const school of schoolsWithIssues) {
    const schoolCode = formatSchoolDisplayCode(school.code, school.id)
    const status = mapPrismaSubscriptionStatus(school.subscriptionStatus)
    const dedupeKey = `school-status:${school.id}`
    activeDedupeKeys.push(dedupeKey)

    const kind =
      status === "blocked"
        ? "school_subscription_blocked"
        : status === "hold"
          ? "school_subscription_hold"
          : "school_subscription_inactive"

    upserts.push({
      dedupeKey,
      kind,
      priority: status === "blocked" ? "urgent" : "high",
      title: `${school.name} subscription ${formatSubscriptionLabel(status).toLowerCase()}`,
      body: `Review billing and subscription settings for ${school.name}.`,
      href: subscriptionTabHref(schoolCode),
      metadata: { schoolId: school.id, schoolCode, status },
    })
  }

  for (const payment of actionablePayments) {
    const schoolCode = formatSchoolDisplayCode(payment.school.code, payment.school.id)
    const status = mapPrismaPaymentStatus(payment.status)
    const statusLabel = formatPaymentStatusLabel(status).toLowerCase()
    const amountLabel = formatAmountLabel(payment.amountPaise, payment.currency)
    const prefix =
      status === "failed"
        ? "payment-failed"
        : status === "due"
          ? "payment-due"
          : "payment-late"
    const dedupeKey = `${prefix}:${payment.id}`
    activeDedupeKeys.push(dedupeKey)

    upserts.push({
      dedupeKey,
      kind:
        status === "failed"
          ? "subscription_payment_failed"
          : status === "due"
            ? "subscription_payment_due"
            : "subscription_payment_late",
      priority: status === "failed" ? "high" : "normal",
      title: `${payment.school.name} payment ${statusLabel}`,
      body: `${payment.serviceName}${amountLabel ? ` · ${amountLabel}` : ""} (${payment.transactionId}).`,
      href: subscriptionTabHref(schoolCode),
      metadata: {
        paymentId: payment.id,
        schoolId: payment.school.id,
        transactionId: payment.transactionId,
        status,
      },
    })
  }

  if (unassignedStudents > 0) {
    const dedupeKey = "students-unassigned"
    activeDedupeKeys.push(dedupeKey)
    upserts.push({
      dedupeKey,
      kind: "students_unassigned",
      priority: unassignedStudents >= 10 ? "high" : "normal",
      title: `${unassignedStudents} student${unassignedStudents === 1 ? "" : "s"} without a class`,
      body: "Assign students to sections so they can access the right content.",
      href: "/schools",
      metadata: { count: unassignedStudents },
    })
  }

  if (platformSettings?.maintenanceMode) {
    const dedupeKey = "maintenance-mode"
    activeDedupeKeys.push(dedupeKey)
    const message =
      platformSettings.maintenanceMessage?.trim() ||
      "Student access may be limited until maintenance is turned off."
    upserts.push({
      dedupeKey,
      kind: "maintenance_mode",
      priority: "urgent",
      title: "Maintenance mode is enabled",
      body: message,
      href: "/management?tab=subscription-settings",
      metadata: { maintenanceMode: true },
    })
  }

  await Promise.all(upserts.map((input) => notificationRepository.upsertNotification(input)))
  await notificationRepository.deleteSmartNotificationsExcept(activeDedupeKeys)
}
