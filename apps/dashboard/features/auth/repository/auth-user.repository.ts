import { mapPrismaRoleToAppRole } from "@/features/user/model/user"
import { prisma } from "@/lib/db"

import type { AuthUserRecord } from "../model/auth-session"

function mapRow(row: {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: "ADMIN" | "STUDENT"
  passwordHash: string
  mustChangePassword: boolean
}): AuthUserRecord {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    role: mapPrismaRoleToAppRole(row.role),
    passwordHash: row.passwordHash,
    mustChangePassword: row.mustChangePassword,
  }
}

export class AuthUserRepository {
  async findById(userId: string): Promise<AuthUserRecord | null> {
    const row = await prisma.user.findUnique({ where: { id: userId } })
    return row ? mapRow(row) : null
  }

  async findByUsernameOrEmail(
    identifier: string
  ): Promise<AuthUserRecord | null> {
    const normalized = identifier.trim().toLowerCase()
    const row = await prisma.user.findFirst({
      where: {
        OR: [{ username: normalized }, { email: normalized }],
      },
    })
    return row ? mapRow(row) : null
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
    options?: { clearMustChangePassword?: boolean }
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        ...(options?.clearMustChangePassword
          ? { mustChangePassword: false }
          : {}),
      },
    })
  }
}

export const authUserRepository = new AuthUserRepository()
