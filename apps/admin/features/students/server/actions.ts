"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import {
  studentCreateSchema,
  studentUpdateSchema,
} from "../model/student-list-item"
import { studentService } from "../service/student.service"

function uniqueField(error: unknown): string | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target
    if (Array.isArray(target)) return target.join(", ")
    if (typeof target === "string") return target
    return "username or email"
  }
  return null
}

export async function createStudentAction(
  raw: unknown
): Promise<ActionResult<undefined>> {
  const parsed = parseInput(studentCreateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await studentService.createStudent(parsed.data)
    revalidatePath("/students")
    return actionOk(undefined, "Student created")
  } catch (error) {
    const field = uniqueField(error)
    if (field) {
      return actionError(`A user with this ${field} already exists.`)
    }
    return actionError("Could not create the student. Please try again.")
  }
}

export async function updateStudentAction(
  id: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing student id.")

  const parsed = parseInput(studentUpdateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await studentService.updateStudent(id, parsed.data)
    revalidatePath("/students")
    return actionOk(undefined, "Student updated")
  } catch (error) {
    const field = uniqueField(error)
    if (field) {
      return actionError(`A user with this ${field} already exists.`)
    }
    return actionError("Could not update the student. Please try again.")
  }
}

export async function deleteStudentAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing student id.")

  try {
    await studentService.deleteStudent(id)
    revalidatePath("/students")
    return actionOk({ id }, "Student deleted")
  } catch {
    return actionError("Could not delete the student. Please try again.")
  }
}
