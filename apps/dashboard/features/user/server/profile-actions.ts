"use server"

import { revalidatePath } from "next/cache"

import {
  actionError,
  actionOk,
  type ActionResult,
  parseInput,
  zodFieldErrors,
} from "@/lib/actions/action-result"
import { requireStudentSession } from "@/lib/auth/session"
import { Prisma } from "@/lib/generated/prisma"

import type { ProfilePageData } from "../model/profile"
import { profilePasswordSchema, profileUpdateSchema } from "../model/profile"
import { userService } from "../service/user.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

function revalidateProfilePaths() {
  revalidatePath("/profile")
  revalidatePath("/dashboard", "layout")
  revalidatePath("/subjects", "layout")
  revalidatePath("/performance", "layout")
  revalidatePath("/ai-tutor", "layout")
}

export async function updateProfileAction(
  raw: unknown
): Promise<ActionResult<ProfilePageData>> {
  let session
  try {
    session = await requireStudentSession()
  } catch {
    return actionError("You must be signed in.")
  }

  const parsed = parseInput(profileUpdateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const profile = await userService.updateProfile(session.sub, parsed.data)
    revalidateProfilePaths()
    return actionOk(profile, "Profile updated")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("Email is already registered.")
    }
    const message =
      error instanceof Error ? error.message : "Could not update your profile."
    return actionError(message)
  }
}

export async function changeProfilePasswordAction(
  raw: unknown
): Promise<ActionResult<undefined>> {
  let session
  try {
    session = await requireStudentSession()
  } catch {
    return actionError("You must be signed in.")
  }

  const parsed = profilePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return actionError(
      "Please fix the highlighted fields.",
      zodFieldErrors(parsed.error)
    )
  }

  try {
    await userService.changePassword(session.sub, parsed.data)
    return actionOk(undefined, "Password updated")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update your password."
    return actionError(message)
  }
}
