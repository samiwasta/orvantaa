"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import { topicInputSchema } from "../model/content-models"
import { contentService } from "../service/content.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export async function createTopicAction(
  chapterId: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!chapterId) return actionError("Missing chapter id.")

  const parsed = parseInput(topicInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await contentService.createTopic(chapterId, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Topic created")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This chapter already has a topic with that slug.")
    }
    return actionError("Could not create the topic. Please try again.")
  }
}

export async function updateTopicAction(
  id: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing topic id.")

  const parsed = parseInput(topicInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await contentService.updateTopic(id, parsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Topic updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This chapter already has a topic with that slug.")
    }
    return actionError("Could not update the topic. Please try again.")
  }
}

export async function deleteTopicAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing topic id.")

  try {
    await contentService.deleteTopic(id)
    revalidatePath("/content")
    return actionOk({ id }, "Topic deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the topic. Please try again."
    return actionError(message)
  }
}
