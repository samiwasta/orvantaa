import { redirect } from "next/navigation"

import { requireStudentSession } from "@/features/auth/server/get-auth-session"
import { SUBSCRIPTION_UNAVAILABLE_PATH } from "@/lib/auth/constants"

import {
  isSchoolSubscriptionAccessAllowed,
  subscriptionAccessMessage,
} from "../model/school-subscription"
import { schoolSubscriptionService } from "../service/school-subscription.service"

export async function assertStudentSchoolAccess(): Promise<void> {
  const session = await requireStudentSession()
  const access = await schoolSubscriptionService.getStudentSchoolAccess(
    session.sub
  )

  if (isSchoolSubscriptionAccessAllowed(access.status)) {
    return
  }

  const params = new URLSearchParams({
    status: access.status,
    message: subscriptionAccessMessage(access.status),
  })
  if (access.schoolName) {
    params.set("school", access.schoolName)
  }

  redirect(`${SUBSCRIPTION_UNAVAILABLE_PATH}?${params.toString()}`)
}
