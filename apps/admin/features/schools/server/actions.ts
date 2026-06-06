"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  actionError,
  actionOk,
  type ActionResult,
  parseInput,
} from "@/lib/actions/action-result"

import { schoolCreateInputSchema, schoolInputSchema } from "../model/school-list-item"
import { schoolService } from "../service/school.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export async function createSchoolAction(
  raw: unknown
): Promise<ActionResult<undefined>> {
  const parsed = parseInput(schoolCreateInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolService.createSchool(parsed.data)
    revalidatePath("/schools")
    return actionOk(undefined, "School created")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("A school with this code already exists.")
    }
    return actionError("Could not create the school. Please try again.")
  }
}

export async function updateSchoolAction(
  id: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing school id.")

  const parsed = parseInput(schoolInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolService.updateSchool(id, parsed.data)
    revalidatePath("/schools")
    return actionOk(undefined, "School updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("A school with this code already exists.")
    }
    return actionError("Could not update the school. Please try again.")
  }
}

export async function deleteSchoolAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing school id.")

  try {
    await schoolService.deleteSchool(id)
    revalidatePath("/schools")
    return actionOk({ id }, "School deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the school. Please try again."
    return actionError(message)
  }
}
