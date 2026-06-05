"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import { schoolDetailHref } from "../model/school-list-item"
import {
  schoolBillingEmailSchema,
  schoolContactInputSchema,
} from "../model/school-contact"
import { schoolManagementService } from "../service/school-management.service"

function revalidateSchool(schoolCode: string) {
  revalidatePath(schoolDetailHref(schoolCode))
  revalidatePath("/schools")
}

export async function createSchoolContactAction(
  schoolId: string,
  schoolCode: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!schoolId) return actionError("Missing school id.")

  const parsed = parseInput(schoolContactInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolManagementService.createContact(schoolId, parsed.data)
    revalidateSchool(schoolCode)
    return actionOk(undefined, "Contact added")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not add the contact. Please try again."
    return actionError(message)
  }
}

export async function updateSchoolContactAction(
  schoolId: string,
  schoolCode: string,
  contactId: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!schoolId || !contactId) return actionError("Missing contact id.")

  const parsed = parseInput(schoolContactInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolManagementService.updateContact(schoolId, contactId, parsed.data)
    revalidateSchool(schoolCode)
    return actionOk(undefined, "Contact updated")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not update the contact. Please try again."
    return actionError(message)
  }
}

export async function deleteSchoolContactAction(
  schoolId: string,
  schoolCode: string,
  contactId: string
): Promise<ActionResult<{ id: string }>> {
  if (!schoolId || !contactId) return actionError("Missing contact id.")

  try {
    await schoolManagementService.deleteContact(schoolId, contactId)
    revalidateSchool(schoolCode)
    return actionOk({ id: contactId }, "Contact removed")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not remove the contact. Please try again."
    return actionError(message)
  }
}

export async function updateSchoolBillingEmailAction(
  schoolId: string,
  schoolCode: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!schoolId) return actionError("Missing school id.")

  const parsed = parseInput(schoolBillingEmailSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolManagementService.updateBillingEmail(
      schoolId,
      parsed.data.billingEmail
    )
    revalidateSchool(schoolCode)
    return actionOk(undefined, "Billing email updated")
  } catch (error) {
    return actionError("Could not update billing email. Please try again.")
  }
}
