"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
} from "@/lib/actions/action-result"
import { requireAdminSession } from "@/lib/auth/session"

import type { AdminNotificationSummary } from "../model/notification"
import { notificationService } from "../service/notification.service"

function revalidateShellPaths() {
  revalidatePath("/dashboard", "layout")
}

export async function refreshAdminNotificationsAction(): Promise<
  ActionResult<AdminNotificationSummary>
> {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  const summary = await notificationService.refreshForUser(session.sub)
  return actionOk(summary)
}

export async function markAdminNotificationReadAction(
  notificationId: string
): Promise<ActionResult<AdminNotificationSummary>> {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  if (!notificationId?.trim()) {
    return actionError("Missing notification id.")
  }

  await notificationService.markRead(notificationId, session.sub)
  revalidateShellPaths()
  const summary = await notificationService.refreshForUser(session.sub)
  return actionOk(summary)
}

export async function markAllAdminNotificationsReadAction(): Promise<
  ActionResult<AdminNotificationSummary>
> {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  await notificationService.markAllRead(session.sub)
  revalidateShellPaths()
  const summary = await notificationService.refreshForUser(session.sub)
  return actionOk(summary)
}
