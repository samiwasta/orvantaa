"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import { subjectInputSchema } from "../model/content-models"
import { contentService } from "../service/content.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export async function createSubjectAction(
  classId: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!classId) return actionError("Missing class id.")

  const parsed = parseInput(subjectInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await contentService.createSubject(classId, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Subject created")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This class already has a subject with that slug.")
    }
    return actionError("Could not create the subject. Please try again.")
  }
}

export async function updateSubjectAction(
  id: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing subject id.")

  const parsed = parseInput(subjectInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await contentService.updateSubject(id, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Subject updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This class already has a subject with that slug.")
    }
    return actionError("Could not update the subject. Please try again.")
  }
}

export async function deleteSubjectAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing subject id.")

  try {
    await contentService.deleteSubject(id)
    revalidatePath("/content")
    return actionOk({ id }, "Subject deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the subject. Please try again."
    return actionError(message)
  }
}
