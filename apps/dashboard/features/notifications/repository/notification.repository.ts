import { prisma } from "@/lib/db"
import type { Prisma } from "@/lib/generated/prisma"

import {
  mapNotificationKindToPrisma,
  mapNotificationPriorityToPrisma,
  mapPrismaNotificationKind,
  mapPrismaNotificationPriority,
  SMART_STUDENT_NOTIFICATION_PREFIXES,
  type StudentNotificationItem,
  type UpsertStudentNotificationInput,
} from "../model/notification"

function mapRow(row: {
  id: string
  kind: Parameters<typeof mapPrismaNotificationKind>[0]
  priority: Parameters<typeof mapPrismaNotificationPriority>[0]
  title: string
  body: string
  href: string | null
  createdAt: Date
  readAt: Date | null
}): StudentNotificationItem {
  return {
    id: row.id,
    kind: mapPrismaNotificationKind(row.kind),
    priority: mapPrismaNotificationPriority(row.priority),
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.createdAt.toISOString(),
    read: row.readAt !== null,
  }
}

export class NotificationRepository {
  async upsertForUser(
    userId: string,
    input: UpsertStudentNotificationInput
  ): Promise<void> {
    const metadata = input.metadata as Prisma.InputJsonValue | undefined

    await prisma.studentNotification.upsert({
      where: {
        userId_dedupeKey: {
          userId,
          dedupeKey: input.dedupeKey,
        },
      },
      create: {
        userId,
        dedupeKey: input.dedupeKey,
        kind: mapNotificationKindToPrisma(input.kind),
        priority: mapNotificationPriorityToPrisma(input.priority ?? "normal"),
        title: input.title,
        body: input.body,
        href: input.href ?? null,
        metadata,
      },
      update: {
        kind: mapNotificationKindToPrisma(input.kind),
        priority: mapNotificationPriorityToPrisma(input.priority ?? "normal"),
        title: input.title,
        body: input.body,
        href: input.href ?? null,
        metadata,
        ...(input.dedupeKey.startsWith("support-ticket:")
          ? { readAt: null }
          : {}),
      },
    })
  }

  async deleteSmartNotificationsExcept(
    userId: string,
    activeDedupeKeys: string[]
  ): Promise<void> {
    const activeSet = new Set(activeDedupeKeys)

    const rows = await prisma.studentNotification.findMany({
      where: {
        userId,
        OR: SMART_STUDENT_NOTIFICATION_PREFIXES.map((prefix) => ({
          dedupeKey: prefix,
        })),
      },
      select: { id: true, dedupeKey: true },
    })

    const staleIds = rows
      .filter((row) => !activeSet.has(row.dedupeKey))
      .map((row) => row.id)

    if (staleIds.length === 0) return

    await prisma.studentNotification.deleteMany({
      where: { id: { in: staleIds }, userId },
    })
  }

  async listForUser(
    userId: string,
    limit = 25
  ): Promise<StudentNotificationItem[]> {
    const rows = await prisma.studentNotification.findMany({
      where: { userId },
      take: limit,
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        kind: true,
        priority: true,
        title: true,
        body: true,
        href: true,
        createdAt: true,
        readAt: true,
      },
    })

    return rows.map(mapRow)
  }

  async countUnreadForUser(userId: string): Promise<number> {
    return prisma.studentNotification.count({
      where: {
        userId,
        readAt: null,
      },
    })
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await prisma.studentNotification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })
  }

  async markAllRead(userId: string): Promise<void> {
    await prisma.studentNotification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })
  }
}

export const notificationRepository = new NotificationRepository()
