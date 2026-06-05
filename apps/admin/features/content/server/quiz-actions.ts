"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import {
  quizCreateSchema,
  quizSaveSchema,
} from "../model/quiz-models"
import { contentService } from "../service/content.service"

const reorderItemsSchema = z
  .array(z.string().trim().min(1))
  .min(1, "Order is required")

export async function createQuizAction(
  chapterId: string,
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  if (!chapterId) return actionError("Missing chapter id.")

  const parsed = parseInput(quizCreateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const id = await contentService.createQuiz(chapterId, parsed.data)
    revalidatePath("/content")
    return actionOk({ id }, "Quiz created")
  } catch {
    return actionError("Could not create the quiz. Please try again.")
  }
}

export async function saveQuizAction(
  id: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing quiz id.")

  const parsed = parseInput(quizSaveSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await contentService.saveQuiz(id, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Quiz saved")
  } catch {
    return actionError("Could not save the quiz. Please try again.")
  }
}

export async function reorderQuizzesAction(
  chapterId: string,
  orderedIds: unknown
): Promise<ActionResult<undefined>> {
  if (!chapterId) return actionError("Missing chapter id.")

  const parsed = parseInput(reorderItemsSchema, orderedIds)
  if (!parsed.success) return parsed.result

  try {
    await contentService.reorderQuizzes(chapterId, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Quiz order updated")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not update quiz order. Please try again."
    return actionError(message)
  }
}

export async function deleteQuizAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing quiz id.")

  try {
    await contentService.deleteQuiz(id)
    revalidatePath("/content")
    return actionOk({ id }, "Quiz deleted")
  } catch {
    return actionError("Could not delete the quiz. Please try again.")
  }
}
