"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
} from "@/lib/actions/action-result"

import { schoolDetailHref } from "../model/school-list-item"
import { schoolClassService } from "../service/school-class.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export async function createSchoolClassesAction(
  schoolId: string,
  boardId: string,
  schoolCode: string,
  raw: unknown
): Promise<ActionResult<{ created: number }>> {
  if (!schoolId || !boardId) return actionError("Missing school id.")

  try {
    const created = await schoolClassService.createClassesFromBoardOptions(
      schoolId,
      boardId,
      raw
    )
    revalidatePath(schoolDetailHref(schoolCode))
    revalidatePath("/schools")
    revalidatePath("/classes")
    return actionOk(
      { created },
      `${created} class${created === 1 ? "" : "es"} added`
    )
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("One or more selected classes already exist for this school.")
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not add classes. Please try again."
    return actionError(message)
  }
}
