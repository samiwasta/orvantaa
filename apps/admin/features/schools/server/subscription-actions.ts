"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"
import { requireAdminSession } from "@/lib/auth/session"

import { schoolDetailHref } from "../model/school-list-item"
import {
  createSubscriptionPaymentLinkSchema,
  type CreateSubscriptionPaymentLinkResult,
} from "../model/subscription-payment"
import { startRecurringSubscriptionSchema } from "../model/recurring-subscription"
import { schoolRecurringSubscriptionService } from "../service/school-recurring-subscription.service"
import { schoolSubscriptionService } from "../service/school-subscription.service"

function revalidateSchoolSubscription(schoolCode: string) {
  revalidatePath(schoolDetailHref(schoolCode))
  revalidatePath("/schools")
  revalidatePath("/dashboard", "layout")
}

export async function syncSchoolSubscriptionPaymentsAction(
  schoolId: string,
  schoolCode: string
): Promise<ActionResult<{ synced: number }>> {
  if (!schoolId) return actionError("Missing school id.")

  try {
    const synced = await schoolSubscriptionService.syncPaymentsFromRazorpay(
      schoolId
    )
    revalidateSchoolSubscription(schoolCode)
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

export async function createSchoolSubscriptionPaymentLinkAction(
  schoolId: string,
  schoolCode: string,
  raw: unknown
): Promise<ActionResult<CreateSubscriptionPaymentLinkResult>> {
  try {
    await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  if (!schoolId) return actionError("Missing school id.")

  const parsed = parseInput(createSubscriptionPaymentLinkSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const result = await schoolSubscriptionService.createPaymentLink(
      schoolId,
      parsed.data
    )
    revalidateSchoolSubscription(schoolCode)
    return actionOk(
      result,
      parsed.data.sendEmail
        ? "Payment link created and billing email sent"
        : "Payment link created"
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not create the payment link."
    return actionError(message)
  }
}

export async function startSchoolRecurringSubscriptionAction(
  schoolId: string,
  schoolCode: string,
  raw: unknown
): Promise<ActionResult<{ authUrl: string | null }>> {
  try {
    await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  if (!schoolId) return actionError("Missing school id.")

  const parsed = parseInput(startRecurringSubscriptionSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const result = await schoolRecurringSubscriptionService.startRecurringSubscription(
      schoolId,
      parsed.data
    )
    revalidateSchoolSubscription(schoolCode)
    return actionOk(
      { authUrl: result.authUrl },
      parsed.data.sendEmail
        ? "Recurring subscription started and setup email sent"
        : "Recurring subscription started"
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not start the recurring subscription."
    return actionError(message)
  }
}

export async function cancelSchoolRecurringSubscriptionAction(
  schoolId: string,
  schoolCode: string
): Promise<ActionResult<undefined>> {
  try {
    await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  if (!schoolId) return actionError("Missing school id.")

  try {
    await schoolRecurringSubscriptionService.cancelRecurringSubscription(schoolId)
    revalidateSchoolSubscription(schoolCode)
    return actionOk(undefined, "Recurring subscription cancelled")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not cancel the recurring subscription."
    return actionError(message)
  }
}

export async function syncSchoolRecurringSubscriptionAction(
  schoolId: string,
  schoolCode: string
): Promise<ActionResult<undefined>> {
  if (!schoolId) return actionError("Missing school id.")

  try {
    await schoolRecurringSubscriptionService.syncRecurringSubscription(schoolId)
    revalidateSchoolSubscription(schoolCode)
    return actionOk(undefined, "Subscription synced from Razorpay")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not sync the subscription from Razorpay."
    return actionError(message)
  }
}
