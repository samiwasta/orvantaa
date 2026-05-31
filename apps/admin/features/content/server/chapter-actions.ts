"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import { chapterInputSchema } from "../model/content-models"
import { contentService } from "../service/content.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export async function createChapterAction(
  subjectId: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!subjectId) return actionError("Missing subject id.")

  const parsed = parseInput(chapterInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await contentService.createChapter(subjectId, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Chapter created")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This subject already has a chapter with that slug.")
    }
    return actionError("Could not create the chapter. Please try again.")
  }
}

export async function updateChapterAction(
  id: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing chapter id.")

  const parsed = parseInput(chapterInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await contentService.updateChapter(id, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Chapter updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This subject already has a chapter with that slug.")
    }
    return actionError("Could not update the chapter. Please try again.")
  }
}

export async function deleteChapterAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing chapter id.")

  try {
    await contentService.deleteChapter(id)
    revalidatePath("/content")
    return actionOk({ id }, "Chapter deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the chapter. Please try again."
    return actionError(message)
  }
}
