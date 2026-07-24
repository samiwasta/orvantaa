"use server"

import { Prisma } from "@/lib/generated/prisma"
import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"
import { requireAdminSession } from "@/lib/auth/session"
import { isSuperAdminUsername } from "@/lib/auth/super-admin"
import { notificationService } from "@/features/notifications/service/notification.service"
import { formatUserFullName } from "@/features/user/model/user"
import { userRepository } from "@/features/user/repository/user.repository"

import type { TeamMember } from "../model/team-member"
import { teamMemberCreateSchema } from "../model/team-member"
import { teamRepository } from "../repository/team.repository"
import { teamService } from "../service/team.service"

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

async function resolveActorName(adminId: string, fallbackUsername: string) {
  const actor = await userRepository.findById(adminId)
  if (!actor) return fallbackUsername
  return formatUserFullName(actor.firstName, actor.lastName) || fallbackUsername
}

export async function createTeamMemberAction(
  raw: unknown
): Promise<ActionResult<TeamMember>> {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  const parsed = parseInput(teamMemberCreateSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const member = await teamService.createMember(parsed.data)
    const actorName = await resolveActorName(session.sub, session.username)
    await notificationService.notifyTeamMemberAdded({
      memberId: member.id,
      fullName: member.fullName,
      username: member.username,
      actorName,
    })
    revalidatePath("/management")
    revalidatePath("/dashboard", "layout")
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

  if (!isSuperAdminUsername(session.username)) {
    return actionError("Only the super admin can remove team members.")
  }

  try {
    const admin = await teamRepository.findAdminById(id)
    if (!admin) {
      return actionError("Admin account not found.")
    }

    const actorName = await resolveActorName(session.sub, session.username)
    const fullName =
      [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.username

    await teamService.deleteMember(id, session.sub, session.username)
    await notificationService.notifyTeamMemberRemoved({
      memberId: admin.id,
      fullName,
      username: admin.username,
      actorName,
    })
    revalidatePath("/management")
    revalidatePath("/dashboard", "layout")
    return actionOk({ id }, "Admin removed")
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not remove the admin. Please try again."
    return actionError(message)
  }
}
