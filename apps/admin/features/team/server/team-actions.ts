"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"
import { requireAdminSession } from "@/lib/auth/session"

import type { TeamMember } from "../model/team-member"
import { teamMemberCreateSchema } from "../model/team-member"
import { teamService } from "../service/team.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export async function createTeamMemberAction(
  raw: unknown
): Promise<ActionResult<TeamMember>> {
  try {
    await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  const parsed = parseInput(teamMemberCreateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const member = await teamService.createMember(parsed.data)
    revalidatePath("/team")
    return actionOk(member, "Admin created and invite email sent")
  } catch (error) {
    if (isUniqueError(error)) {
      return actionError("Username or email already exists.")
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not create the user. Please try again."
    return actionError(message)
  }
}

export async function generateTeamPasswordAction(): Promise<
  ActionResult<{ password: string }>
> {
  try {
    await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  return actionOk({ password: teamService.generatePassword() })
}

export async function deleteTeamMemberAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  if (!id?.trim()) {
    return actionError("Missing admin id.")
  }

  try {
    await teamService.deleteMember(id, session.sub)
    revalidatePath("/team")
    return actionOk({ id }, "Admin removed")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not remove the admin. Please try again."
    return actionError(message)
  }
}
