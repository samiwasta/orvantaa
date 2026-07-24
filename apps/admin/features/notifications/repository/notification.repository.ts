import type { Prisma } from "@/lib/generated/prisma"

import { prisma } from "@/lib/db"

import {
  mapNotificationKindToPrisma,
  mapNotificationPriorityToPrisma,
  mapPrismaNotificationKind,
  mapPrismaNotificationPriority,
  SMART_NOTIFICATION_PREFIXES,
  type AdminNotificationItem,
  type UpsertNotificationInput,
} from "../model/notification"

function mapRow(
  row: {
    id: string
    kind: Parameters<typeof mapPrismaNotificationKind>[0]
    priority: Parameters<typeof mapPrismaNotificationPriority>[0]
    title: string
    body: string
    href: string | null
    createdAt: Date
    reads: { userId: string }[]
  },
  userId: string
): AdminNotificationItem {
  return {
    id: row.id,
    kind: mapPrismaNotificationKind(row.kind),
    priority: mapPrismaNotificationPriority(row.priority),
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.createdAt.toISOString(),
    read: row.reads.some((read) => read.userId === userId),
  }
}

export class NotificationRepository {
  async upsertNotification(input: UpsertNotificationInput): Promise<void> {
    const metadata = input.metadata as Prisma.InputJsonValue | undefined

    await prisma.adminNotification.upsert({
      where: { dedupeKey: input.dedupeKey },
      create: {
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
      },
    })
  }

  async deleteSmartNotificationsExcept(activeDedupeKeys: string[]): Promise<void> {
    const activeSet = new Set(activeDedupeKeys)

    const rows = await prisma.adminNotification.findMany({
      where: {
        OR: SMART_NOTIFICATION_PREFIXES.map((prefix) => ({
          dedupeKey: prefix.endsWith(":")
            ? { startsWith: prefix }
            : { equals: prefix },
        })),
      },
      select: { id: true, dedupeKey: true },
    })

    const staleIds = rows
      .filter((row) => !activeSet.has(row.dedupeKey))
      .map((row) => row.id)

    if (staleIds.length === 0) return

    await prisma.adminNotification.deleteMany({
      where: { id: { in: staleIds } },
    })
  }

  async listForUser(userId: string, limit = 25): Promise<AdminNotificationItem[]> {
    const rows = await prisma.adminNotification.findMany({
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
        reads: {
          where: { userId },
          select: { userId: true },
        },
      },
    })

    return rows.map((row) => mapRow(row, userId))
  }

  async countUnreadForUser(userId: string): Promise<number> {
    return prisma.adminNotification.count({
      where: {
        reads: {
          none: { userId },
        },
      },
    })
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await prisma.adminNotificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
      create: {
        notificationId,
        userId,
      },
      update: {},
    })
  }

  async markAllRead(userId: string): Promise<void> {
    const unread = await prisma.adminNotification.findMany({
      where: {
        reads: {
          none: { userId },
        },
      },
      select: { id: true },
    })

    if (unread.length === 0) return

    await prisma.adminNotificationRead.createMany({
      data: unread.map((row) => ({
        notificationId: row.id,
        userId,
      })),
      skipDuplicates: true,
    })
  }
}

export const notificationRepository = new NotificationRepository()
