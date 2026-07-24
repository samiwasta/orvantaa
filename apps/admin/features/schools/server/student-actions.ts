"use server"

import { Prisma } from "@/lib/generated/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  actionError,
  actionOk,
  type ActionResult,
  parseInput,
} from "@/lib/actions/action-result"

import { schoolDetailHref } from "../model/school-list-item"
import {
  schoolStudentCreateSchema,
  schoolStudentInputSchema,
} from "../model/school-student-list-item"
import { schoolRepository } from "../repository/school.repository"
import { schoolStudentsService } from "../service/school-students.service"

const subscriptionUpdateSchema = z.object({
  subscriptionStatus: z.enum(["active", "inactive", "hold", "blocked"]),
})

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

function revalidateSchool(schoolCode: string) {
  revalidatePath(schoolDetailHref(schoolCode))
  revalidatePath("/schools")
}

export async function createSchoolStudentAction(
  schoolId: string,
  schoolCode: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!schoolId) return actionError("Missing school id.")

  const parsed = parseInput(schoolStudentCreateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolStudentsService.createStudent(schoolId, parsed.data)
    revalidateSchool(schoolCode)
    return actionOk(undefined, "Student created")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("Email, student code, or username already exists.")
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not create the student. Please try again."
    return actionError(message)
  }
}

export async function updateSchoolStudentAction(
  schoolId: string,
  schoolCode: string,
  studentId: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!schoolId || !studentId) return actionError("Missing student id.")

  const parsed = parseInput(schoolStudentInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolStudentsService.updateStudent(schoolId, studentId, parsed.data)
    revalidateSchool(schoolCode)
    return actionOk(undefined, "Student updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("Email or student code already exists.")
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not update the student. Please try again."
    return actionError(message)
  }
}

export async function deleteSchoolStudentAction(
  schoolId: string,
  schoolCode: string,
  studentId: string
): Promise<ActionResult<{ id: string }>> {
  if (!schoolId || !studentId) return actionError("Missing student id.")

  try {
    await schoolStudentsService.deleteStudent(schoolId, studentId)
    revalidateSchool(schoolCode)
    return actionOk({ id: studentId }, "Student deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the student. Please try again."
    return actionError(message)
  }
}

export async function importSchoolStudentsCsvAction(
  schoolId: string,
  schoolCode: string,
  csvText: unknown
): Promise<ActionResult<{ imported: number }>> {
  if (!schoolId) return actionError("Missing school id.")
  if (typeof csvText !== "string" || !csvText.trim()) {
    return actionError("Upload a CSV file with student data.")
  }

  try {
    const sections = await schoolStudentsService.getSectionOptions(schoolId)
    const result = await schoolStudentsService.importStudentsFromCsv(
      schoolId,
      csvText,
      sections
    )
    revalidateSchool(schoolCode)
    return actionOk(
      result,
      `${result.imported} student${result.imported === 1 ? "" : "s"} imported`
    )
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("A student email or code in the CSV already exists.")
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not import students. Please try again."
    return actionError(message)
  }
}

export async function sendSchoolStudentCredentialsAction(
  schoolId: string,
  schoolCode: string,
  classFilter: unknown
): Promise<ActionResult<{ sent: number; failed: number }>> {
  if (!schoolId) return actionError("Missing school id.")

  const classId =
    typeof classFilter === "string" && classFilter !== "all"
      ? classFilter
      : undefined

  try {
    const result = await schoolStudentsService.sendCredentialsToPendingStudents(
      schoolId,
      classId
    )

    if (result.sent === 0 && result.failed === 0) {
      return actionError("No students with mail status Not Sent.")
    }

    revalidateSchool(schoolCode)

    if (result.failed > 0 && result.sent > 0) {
      return actionOk(
        result,
        `Sent ${result.sent} credential email${result.sent === 1 ? "" : "s"}; ${result.failed} failed`
      )
    }

    if (result.failed > 0) {
      return actionError("Could not send credential emails. Check email configuration.")
    }

    return actionOk(
      result,
      `Sent credentials to ${result.sent} student${result.sent === 1 ? "" : "s"}`
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not send credentials. Please try again."
    return actionError(message)
  }
}

export async function updateSchoolSubscriptionAction(
  schoolId: string,
  schoolCode: string,
  raw: unknown
): Promise<ActionResult<undefined>> {
  if (!schoolId) return actionError("Missing school id.")

  const parsed = parseInput(subscriptionUpdateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await schoolRepository.updateSubscriptionStatus(
      schoolId,
      parsed.data.subscriptionStatus
    )
    revalidateSchool(schoolCode)
    return actionOk(undefined, "Subscription updated")
  } catch {
    return actionError("Could not update subscription. Please try again.")
  }
}
