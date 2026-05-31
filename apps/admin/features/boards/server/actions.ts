"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import { boardInputSchema, type BoardListItem } from "../model/board-list-item"
import { boardService } from "../service/board.service"

function uniqueField(error: unknown): string | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target
    if (Array.isArray(target)) return target.join(", ")
    if (typeof target === "string") return target
    return "field"
  }
  return null
}

export async function createBoardAction(
  raw: unknown
): Promise<ActionResult<BoardListItem>> {
  const parsed = parseInput(boardInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const board = await boardService.createBoard(parsed.data)
    revalidatePath("/boards")
    return actionOk(board, "Board created")
  } catch (error) {
    const field = uniqueField(error)
    if (field) {
      return actionError(`A board with this ${field} already exists.`)
    }
    return actionError("Could not create the board. Please try again.")
  }
}

export async function updateBoardAction(
  id: string,
  raw: unknown
): Promise<ActionResult<BoardListItem>> {
  if (!id) return actionError("Missing board id.")

  const parsed = parseInput(boardInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const board = await boardService.updateBoard(id, parsed.data)
    revalidatePath("/boards")
    return actionOk(board, "Board updated")
  } catch (error) {
    const field = uniqueField(error)
    if (field) {
      return actionError(`A board with this ${field} already exists.`)
    }
    return actionError("Could not update the board. Please try again.")
  }
}

export async function deleteBoardAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing board id.")

  try {
    await boardService.deleteBoard(id)
    revalidatePath("/boards")
    return actionOk({ id }, "Board deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the board. Please try again."
    return actionError(message)
  }
}
