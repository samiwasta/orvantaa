import { cache } from "react"

import {
  emptyStudentNotificationSummary,
  type StudentNotificationSummary,
} from "@/features/notifications/model/notification"
import { notificationService } from "@/features/notifications/service/notification.service"
import { requireStudentSession } from "@/lib/auth/session"

export const loadStudentNotifications = cache(
  async (): Promise<StudentNotificationSummary> => {
    try {
      const session = await requireStudentSession()
      return notificationService.getSummaryForUser(session.sub)
    } catch {
      return emptyStudentNotificationSummary()
    }
  }
)
