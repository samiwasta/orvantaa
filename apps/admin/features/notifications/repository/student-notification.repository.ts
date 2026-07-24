import {
  StudentNotificationKind,
  StudentNotificationPriority,
  type SupportTicketStatus,
} from "@/lib/generated/prisma"

import {
  studentTicketHref,
  ticketStatusLabel,
} from "@/features/queries/model/support-ticket"
import { prisma } from "@/lib/db"

export class StudentNotificationRepository {
  async notifySupportTicketStatusUpdated(input: {
    userId: string
    ticketId: string
    ticketNumber: string
    status: SupportTicketStatus
    adminNote: string | null
  }): Promise<void> {
    const statusLabel = ticketStatusLabel(input.status)
    const noteSuffix = input.adminNote?.trim()
      ? ` ${input.adminNote.trim()}`
      : ""
    const dedupeKey = `support-ticket:status:${input.ticketId}:${input.status}`

    await prisma.studentNotification.upsert({
      where: {
        userId_dedupeKey: {
          userId: input.userId,
          dedupeKey,
        },
      },
      create: {
        userId: input.userId,
        dedupeKey,
        kind: StudentNotificationKind.SUPPORT_TICKET,
        priority:
          input.status === "RESOLVED"
            ? StudentNotificationPriority.HIGH
            : StudentNotificationPriority.NORMAL,
        title: `Ticket ${input.ticketNumber} — ${statusLabel}`,
        body: `Your support ticket is now ${statusLabel.toLowerCase()}.${noteSuffix}`,
        href: studentTicketHref(input.ticketId),
        metadata: {
          ticketId: input.ticketId,
          ticketNumber: input.ticketNumber,
          status: input.status,
        },
      },
      update: {
        kind: StudentNotificationKind.SUPPORT_TICKET,
        priority:
          input.status === "RESOLVED"
            ? StudentNotificationPriority.HIGH
            : StudentNotificationPriority.NORMAL,
        title: `Ticket ${input.ticketNumber} — ${statusLabel}`,
        body: `Your support ticket is now ${statusLabel.toLowerCase()}.${noteSuffix}`,
        href: studentTicketHref(input.ticketId),
        readAt: null,
        metadata: {
          ticketId: input.ticketId,
          ticketNumber: input.ticketNumber,
          status: input.status,
        },
      },
    })
  }
}

export const studentNotificationRepository = new StudentNotificationRepository()
