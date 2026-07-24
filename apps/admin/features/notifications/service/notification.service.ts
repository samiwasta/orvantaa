import type { SupportTicketStatus } from "@/lib/generated/prisma"

import { ticketStatusLabel } from "@/features/queries/model/support-ticket"

import type {
  AdminNotificationItem,
  AdminNotificationSummary,
  UpsertNotificationInput,
} from "../model/notification"
import { notificationRepository } from "../repository/notification.repository"
import { studentNotificationRepository } from "../repository/student-notification.repository"
import { syncSmartNotifications } from "./smart-notification-sync"

export class NotificationService {
  async getSummaryForUser(userId: string): Promise<AdminNotificationSummary> {
    await syncSmartNotifications()

    const [items, unreadCount] = await Promise.all([
      notificationRepository.listForUser(userId),
      notificationRepository.countUnreadForUser(userId),
    ])

    return { items, unreadCount }
  }

  async refreshForUser(userId: string): Promise<AdminNotificationSummary> {
    return this.getSummaryForUser(userId)
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await notificationRepository.markRead(notificationId, userId)
  }

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllRead(userId)
  }

  async notifyTeamMemberAdded(input: {
    memberId: string
    fullName: string
    username: string
    actorName?: string
  }): Promise<void> {
    await this.createEventNotification({
      dedupeKey: `event:team-added:${input.memberId}`,
      kind: "team_member_added",
      priority: "normal",
      title: `${input.fullName} joined the team`,
      body: input.actorName
        ? `${input.actorName} added @${input.username} as an admin.`
        : `@${input.username} was added as an admin.`,
      href: "/management",
      metadata: {
        memberId: input.memberId,
        username: input.username,
      },
    })
  }

  async notifyTeamMemberRemoved(input: {
    memberId: string
    fullName: string
    username: string
    actorName?: string
  }): Promise<void> {
    await this.createEventNotification({
      dedupeKey: `event:team-removed:${input.memberId}:${Date.now()}`,
      kind: "team_member_removed",
      priority: "normal",
      title: `${input.fullName} was removed`,
      body: input.actorName
        ? `${input.actorName} removed @${input.username} from the admin team.`
        : `@${input.username} was removed from the admin team.`,
      href: "/management",
      metadata: {
        memberId: input.memberId,
        username: input.username,
      },
    })
  }

  private async createEventNotification(input: UpsertNotificationInput): Promise<void> {
    await notificationRepository.upsertNotification(input)
  }

  async notifyStudentSupportTicketStatusUpdated(input: {
    userId: string
    ticketId: string
    ticketNumber: string
    status: SupportTicketStatus
    adminNote: string | null
  }): Promise<void> {
    await studentNotificationRepository.notifySupportTicketStatusUpdated(input)
  }

  async notifyAdminsSupportTicketStatusUpdated(input: {
    ticketId: string
    ticketNumber: string
    status: SupportTicketStatus
    studentName: string
    actorName?: string
  }): Promise<void> {
    const statusLabel = ticketStatusLabel(input.status)
    await this.createEventNotification({
      dedupeKey: `support-ticket:status:${input.ticketId}:${input.status}`,
      kind: "support_ticket",
      priority: input.status === "OPEN" ? "high" : "normal",
      title: `${input.ticketNumber} — ${statusLabel}`,
      body: input.actorName
        ? `${input.actorName} marked ${input.studentName}'s ticket as ${statusLabel.toLowerCase()}.`
        : `${input.studentName}'s ticket is now ${statusLabel.toLowerCase()}.`,
      href: `/queries/${input.ticketId}`,
      metadata: {
        ticketId: input.ticketId,
        ticketNumber: input.ticketNumber,
        status: input.status,
      },
    })
  }
}

export const notificationService = new NotificationService()
