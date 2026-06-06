"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { schoolDetailHref } from "@/features/schools/model/school-list-item"
import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"

import {
  classCatalogCreateSchema,
  classCatalogRenameSchema,
  classInputSchema,
  sectionInputSchema,
} from "../model/class-list-item"
import { classService } from "../service/class.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

function revalidateClassPaths(schoolCode?: string) {
  revalidatePath("/classes")
  if (schoolCode) {
    revalidatePath(schoolDetailHref(schoolCode))
    revalidatePath("/schools")
  }
}

export async function createClassCatalogAction(
  raw: unknown
): Promise<ActionResult<undefined>> {
  const parsed = parseInput(classCatalogCreateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await classService.createCatalogClass(parsed.data.name)
    revalidateClassPaths()
    return actionOk(undefined, "Class created")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This class already exists.")
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not create the class. Please try again."
    return actionError(message)
  }
}

export async function renameClassCatalogAction(
  raw: unknown
): Promise<ActionResult<undefined>> {
  const parsed = parseInput(classCatalogRenameSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await classService.renameCatalogClass(
      parsed.data.currentName,
      parsed.data.name
    )
    revalidateClassPaths()
    return actionOk(undefined, "Class updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("A school already has a class with that name.")
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not update the class. Please try again."
    return actionError(message)
  }
}

export async function deleteClassCatalogAction(
  name: string
): Promise<ActionResult<{ name: string }>> {
  const trimmed = name?.trim()
  if (!trimmed) return actionError("Missing class name.")

  try {
    await classService.deleteCatalogClass(trimmed)
    revalidateClassPaths()
    return actionOk({ name: trimmed }, "Class deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the class. Please try again."
    return actionError(message)
  }
}

export async function createClassAction(
  raw: unknown,
  schoolCode?: string
): Promise<ActionResult<undefined>> {
  const parsed = parseInput(classInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await classService.createClass(parsed.data)
    revalidateClassPaths(schoolCode)
    return actionOk(undefined, "Class created")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This school already has a class with that name.")
    }
    return actionError("Could not create the class. Please try again.")
  }
}

export async function updateClassAction(
  id: string,
  name: string,
  schoolCode?: string
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing class id.")
  const trimmed = name.trim()
  if (!trimmed) return actionError("Class name is required.")

  try {
    await classService.updateClass(id, trimmed)
    revalidateClassPaths(schoolCode)
    return actionOk(undefined, "Class updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This school already has a class with that name.")
    }
    return actionError("Could not update the class. Please try again.")
  }
}

export async function deleteClassAction(
  id: string,
  schoolCode?: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing class id.")

  try {
    await classService.deleteClass(id)
    revalidateClassPaths(schoolCode)
    return actionOk({ id }, "Class deleted")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the class. Please try again."
    return actionError(message)
  }
}

export async function createSectionAction(
  raw: unknown,
  schoolCode?: string
): Promise<ActionResult<undefined>> {
  const parsed = parseInput(sectionInputSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    await classService.createSection(parsed.data)
    revalidateClassPaths(schoolCode)
    return actionOk(undefined, "Section added")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This class already has a section with that name.")
    }
    return actionError("Could not add the section. Please try again.")
  }
}

export async function updateSectionAction(
  id: string,
  name: string,
  schoolCode?: string
): Promise<ActionResult<undefined>> {
  if (!id) return actionError("Missing section id.")
  const trimmed = name.trim()
  if (!trimmed) return actionError("Section name is required.")

  try {
    await classService.updateSection(id, trimmed)
    revalidateClassPaths(schoolCode)
    return actionOk(undefined, "Section updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("This class already has a section with that name.")
    }
    return actionError("Could not update the section. Please try again.")
  }
}

export async function deleteSectionAction(
  id: string,
  schoolCode?: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing section id.")

  try {
    await classService.deleteSection(id)
    revalidateClassPaths(schoolCode)
    return actionOk({ id }, "Section removed")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not remove the section. Please try again."
    return actionError(message)
  }
}
