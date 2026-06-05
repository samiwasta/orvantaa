import { Gender, UserRole } from "@prisma/client"

import { mapPrismaRoleToAppRole } from "@/features/user/model/user"
import { prisma } from "@/lib/db"

import type { TeamMember } from "../model/team-member"
import type { TeamMemberCreateInput } from "../model/team-member"

export class TeamRepository {
  async listMembers(): Promise<TeamMember[]> {
    const rows = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    })

    return rows.map((row) => ({
      id: row.id,
      fullName: [row.firstName, row.lastName].filter(Boolean).join(" "),
      username: row.username,
      email: row.email,
      role: mapPrismaRoleToAppRole(row.role),
      createdAt: row.createdAt.toISOString(),
    }))
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const row = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
      select: { id: true },
    })
    return Boolean(row)
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const row = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    })
    return Boolean(row)
  }

  async countAdmins(): Promise<number> {
    return prisma.user.count({ where: { role: UserRole.ADMIN } })
  }

  async findAdminById(id: string): Promise<{ id: string } | null> {
    return prisma.user.findFirst({
      where: { id, role: UserRole.ADMIN },
      select: { id: true },
    })
  }

  async deleteAdmin(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }

  async createMember(
    input: TeamMemberCreateInput,
    passwordHash: string
  ): Promise<TeamMember> {
    const row = await prisma.user.create({
      data: {
        username: input.username.trim().toLowerCase(),
        email: input.email.trim().toLowerCase(),
        firstName: input.firstName.trim(),
        lastName: input.lastName?.trim() ?? "",
        passwordHash,
        gender: Gender.FEMALE,
        role: UserRole.ADMIN,
        sectionId: null,
        studentCode: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    })

    return {
      id: row.id,
      fullName: [row.firstName, row.lastName].filter(Boolean).join(" "),
      username: row.username,
      email: row.email,
      role: mapPrismaRoleToAppRole(row.role),
      createdAt: row.createdAt.toISOString(),
    }
  }
}

export const teamRepository = new TeamRepository()
