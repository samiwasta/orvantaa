"use server"

import { revalidatePath } from "next/cache"

import type { StudentNotificationSummary } from "@/features/notifications/model/notification"
import { notificationService } from "@/features/notifications/service/notification.service"
import {
  actionError,
  actionOk,
  type ActionResult,
} from "@/lib/actions/action-result"
import { requireStudentSession } from "@/lib/auth/session"

function revalidateShellPaths() {
  revalidatePath("/dashboard", "layout")
  revalidatePath("/subjects", "layout")
  revalidatePath("/performance", "layout")
  revalidatePath("/ai-tutor", "layout")
}

export async function refreshStudentNotificationsAction(): Promise<
  ActionResult<StudentNotificationSummary>
> {
  try {
    const session = await requireStudentSession()
    const summary = await notificationService.refreshForUser(session.sub)
    return actionOk(summary)
  } catch {
    return actionError("You must be signed in as a student.")
  }
}

export async function markStudentNotificationReadAction(
  notificationId: string
): Promise<ActionResult<StudentNotificationSummary>> {
  try {
    const session = await requireStudentSession()
    if (!notificationId?.trim()) {
      return actionError("Missing notification id.")
    }

    await notificationService.markRead(notificationId, session.sub)
    revalidateShellPaths()
    const summary = await notificationService.refreshForUser(session.sub)
    return actionOk(summary)
  } catch {
    return actionError("You must be signed in as a student.")
  }
}

export async function markAllStudentNotificationsReadAction(): Promise<
  ActionResult<StudentNotificationSummary>
> {
  try {
    const session = await requireStudentSession()
    await notificationService.markAllRead(session.sub)
    revalidateShellPaths()
    const summary = await notificationService.refreshForUser(session.sub)
    return actionOk(summary)
  } catch {
    return actionError("You must be signed in as a student.")
  }
}
