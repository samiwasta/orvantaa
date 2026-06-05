"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
} from "@/lib/actions/action-result"

import { schoolDetailHref } from "../model/school-list-item"
import { schoolSubscriptionService } from "../service/school-subscription.service"

export async function syncSchoolSubscriptionPaymentsAction(
  schoolId: string,
  schoolCode: string
): Promise<ActionResult<{ synced: number }>> {
  if (!schoolId) return actionError("Missing school id.")

  try {
    const synced = await schoolSubscriptionService.syncPaymentsFromRazorpay(
      schoolId
    )
    revalidatePath(schoolDetailHref(schoolCode))
    return actionOk(
      { synced },
      synced === 0
        ? "No payments found in Razorpay for this school"
        : `Synced ${synced} payment${synced === 1 ? "" : "s"} from Razorpay`
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not sync payments from Razorpay."
    return actionError(message)
  }
}
