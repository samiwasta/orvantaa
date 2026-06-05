import { createHash, randomBytes } from "crypto"

import bcrypt from "bcryptjs"

import { authService } from "@/features/auth/service/auth.service"
import { generateRandomPassword } from "@/features/schools/model/school-student-csv"

import type { TeamMember, TeamMemberCreateInput } from "../model/team-member"
import { teamMemberCreateSchema } from "../model/team-member"
import { teamRepository } from "../repository/team.repository"
import { teamInviteEmailService } from "./team-invite-email.service"

export class TeamService {
  async listMembers(): Promise<TeamMember[]> {
    return teamRepository.listMembers()
  }

  async createMember(raw: unknown): Promise<TeamMember> {
    const parsed = teamMemberCreateSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid user data")
    }

    const input = parsed.data

    if (await teamRepository.isUsernameTaken(input.username)) {
      throw new Error("Username is already taken.")
    }

    if (await teamRepository.isEmailTaken(input.email)) {
      throw new Error("Email is already registered.")
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const member = await teamRepository.createMember(input, passwordHash)

    const rawToken = randomBytes(32).toString("hex")
    const tokenHash = createHash("sha256").update(rawToken).digest("hex")
    await authService.createPasswordResetToken(member.id, tokenHash)

    await teamInviteEmailService.sendAdminInvite({
      to: member.email,
      firstName: input.firstName,
      username: member.username,
      plainPassword: input.password,
      resetToken: rawToken,
    })

    return member
  }

  generatePassword(): string {
    return generateRandomPassword()
  }

  async deleteMember(id: string, currentAdminId: string): Promise<void> {
    if (id === currentAdminId) {
      throw new Error("You cannot delete your own account.")
    }

    const admin = await teamRepository.findAdminById(id)
    if (!admin) {
      throw new Error("Admin account not found.")
    }

    const adminCount = await teamRepository.countAdmins()
    if (adminCount <= 1) {
      throw new Error("At least one admin account must remain.")
    }

    await teamRepository.deleteAdmin(id)
  }
}

export const teamService = new TeamService()
