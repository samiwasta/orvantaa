"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import { noteInputSchema } from "../model/content-models"
import { noteBlocksSchema } from "../model/note-blocks"
import { contentService } from "../service/content.service"

export async function createNoteAction(
  topicId: string,
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  if (!topicId) return actionError("Missing topic id.")

  const parsed = parseInput(noteInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const id = await contentService.createNote(topicId, parsed.data)
    revalidatePath("/content")
    return actionOk({ id }, "Note created")
  } catch {
    return actionError("Could not create the note. Please try again.")
  }
}

export async function saveNoteAction(
  id: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing note id.")

  const titleParsed = parseInput(
    noteInputSchema,
    typeof raw === "object" && raw !== null && "title" in raw
      ? { title: (raw as { title: unknown }).title }
      : raw
  )
  if (!titleParsed.success) return titleParsed.result

  const blocksRaw =
    typeof raw === "object" && raw !== null && "blocks" in raw
      ? (raw as { blocks: unknown }).blocks
      : []
  const blocksParsed = noteBlocksSchema.safeParse(blocksRaw)
  if (!blocksParsed.success) {
    return actionError("Note content has invalid blocks. Please review and try again.")
  }

  try {
    await contentService.saveNote(id, titleParsed.data.title, blocksParsed.data)
    revalidatePath("/content")
    return actionOk(undefined, "Note saved")
  } catch {
    return actionError("Could not save the note. Please try again.")
  }
}

export async function deleteNoteAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing note id.")

  try {
    await contentService.deleteNote(id)
    revalidatePath("/content")
    return actionOk({ id }, "Note deleted")
  } catch {
    return actionError("Could not delete the note. Please try again.")
  }
}
