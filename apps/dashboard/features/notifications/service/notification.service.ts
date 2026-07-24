import { quizHref } from "@/features/subjects/model/content-navigation"
import {
  studentTicketHref,
  SUPPORT_RESPONSE_TIME_LABEL,
} from "@/features/support/model/support-ticket"
import { CHANGE_PASSWORD_PATH } from "@/lib/auth/constants"
import { prisma } from "@/lib/db"
import {
  AdminNotificationKind,
  AdminNotificationPriority,
} from "@/lib/generated/prisma"

import type { UpsertStudentNotificationInput } from "../model/notification"
import { notificationRepository } from "../repository/notification.repository"

async function syncSmartNotifications(userId: string): Promise<void> {
  const activeDedupeKeys: string[] = []
  const upserts: UpsertStudentNotificationInput[] = []

  const [user, platformSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { mustChangePassword: true },
    }),
    prisma.platformSettings.findUnique({
      where: { id: "platform" },
      select: { maintenanceMode: true, maintenanceMessage: true },
    }),
  ])

  if (user?.mustChangePassword) {
    const dedupeKey = "password-change-required"
    activeDedupeKeys.push(dedupeKey)
    upserts.push({
      dedupeKey,
      kind: "password_change_required",
      priority: "high",
      title: "Update your password",
      body: "Your school requires you to set a new password before continuing.",
      href: CHANGE_PASSWORD_PATH,
    })
  }

  if (platformSettings?.maintenanceMode) {
    const dedupeKey = "maintenance-mode"
    activeDedupeKeys.push(dedupeKey)
    upserts.push({
      dedupeKey,
      kind: "maintenance_mode",
      priority: "urgent",
      title: "Maintenance in progress",
      body:
        platformSettings.maintenanceMessage?.trim() ||
        "Some features may be limited while maintenance is underway.",
      href: "/dashboard",
    })
  }

  await Promise.all(
    upserts.map((input) => notificationRepository.upsertForUser(userId, input))
  )
  await notificationRepository.deleteSmartNotificationsExcept(
    userId,
    activeDedupeKeys
  )
}

export class NotificationService {
  async getSummaryForUser(userId: string) {
    await syncSmartNotifications(userId)

    const [items, unreadCount] = await Promise.all([
      notificationRepository.listForUser(userId),
      notificationRepository.countUnreadForUser(userId),
    ])

    return { items, unreadCount }
  }

  async refreshForUser(userId: string) {
    return this.getSummaryForUser(userId)
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await notificationRepository.markRead(notificationId, userId)
  }

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllRead(userId)
  }

  async notifyQuizCompletedFromAttempt(
    userId: string,
    quizId: string,
    attempt: { id: string; scorePercent: number }
  ): Promise<void> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        title: true,
        chapter: {
          select: {
            slug: true,
            subject: { select: { slug: true } },
          },
        },
      },
    })

    if (!quiz) return

    const href = quizHref(quiz.chapter.subject.slug, quiz.chapter.slug, quizId)

    await notificationRepository.upsertForUser(userId, {
      dedupeKey: `quiz-completed:${attempt.id}`,
      kind: "quiz_completed",
      priority: attempt.scorePercent >= 80 ? "normal" : "low",
      title: `Quiz completed: ${quiz.title}`,
      body: `You scored ${attempt.scorePercent}% on this quiz. Review your chapter to keep improving.`,
      href,
      metadata: {
        quizId,
        attemptId: attempt.id,
        scorePercent: attempt.scorePercent,
      },
    })
  }

  async notifyLessonCompletedFromNote(
    userId: string,
    noteId: string
  ): Promise<void> {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: {
        title: true,
        topic: {
          select: {
            slug: true,
            chapter: {
              select: {
                slug: true,
                subject: { select: { slug: true } },
              },
            },
          },
        },
      },
    })

    if (!note) return

    const href = `/subjects/${note.topic.chapter.subject.slug}/${note.topic.chapter.slug}/${note.topic.slug}/${noteId}`

    await notificationRepository.upsertForUser(userId, {
      dedupeKey: `lesson-completed:${noteId}`,
      kind: "lesson_completed",
      priority: "normal",
      title: `Lesson completed: ${note.title}`,
      body: "Nice work finishing this lesson. Continue with the next topic or try a quiz.",
      href,
      metadata: { noteId },
    })
  }

  async notifySupportTicketCreated(input: {
    userId: string
    ticketId: string
    ticketNumber: string
    issueAreaLabel: string
  }): Promise<void> {
    await notificationRepository.upsertForUser(input.userId, {
      dedupeKey: `support-ticket:created:${input.ticketId}`,
      kind: "support_ticket",
      priority: "normal",
      title: `Ticket ${input.ticketNumber} received`,
      body: `We received your ${input.issueAreaLabel} request. Expected response: ${SUPPORT_RESPONSE_TIME_LABEL}.`,
      href: studentTicketHref(input.ticketId),
      metadata: {
        ticketId: input.ticketId,
        ticketNumber: input.ticketNumber,
      },
    })
  }

  async notifyAdminsOfSupportTicket(input: {
    ticketId: string
    ticketNumber: string
    issueAreaLabel: string
    studentName: string
    messagePreview: string
  }): Promise<void> {
    await prisma.adminNotification.upsert({
      where: { dedupeKey: `support-ticket:${input.ticketId}` },
      create: {
        dedupeKey: `support-ticket:${input.ticketId}`,
        kind: AdminNotificationKind.SUPPORT_TICKET,
        priority: AdminNotificationPriority.HIGH,
        title: `New query ${input.ticketNumber}`,
        body: `${input.studentName} raised a ${input.issueAreaLabel} ticket: ${input.messagePreview}`,
        href: `/queries/${input.ticketId}`,
        metadata: {
          ticketId: input.ticketId,
          ticketNumber: input.ticketNumber,
        },
      },
      update: {
        kind: AdminNotificationKind.SUPPORT_TICKET,
        priority: AdminNotificationPriority.HIGH,
        title: `New query ${input.ticketNumber}`,
        body: `${input.studentName} raised a ${input.issueAreaLabel} ticket: ${input.messagePreview}`,
        href: `/queries/${input.ticketId}`,
        metadata: {
          ticketId: input.ticketId,
          ticketNumber: input.ticketNumber,
        },
      },
    })
  }
}

export const notificationService = new NotificationService()
