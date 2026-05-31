"use server"

import { revalidatePath } from "next/cache"

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
