import { cache } from "react"

import { requireAdminSession } from "@/lib/auth/session"

import type { AdminNotificationSummary } from "../model/notification"
import { notificationService } from "../service/notification.service"

export const loadAdminNotifications = cache(
  async (): Promise<AdminNotificationSummary> => {
    const session = await requireAdminSession()
    return notificationService.getSummaryForUser(session.sub)
  }
)
