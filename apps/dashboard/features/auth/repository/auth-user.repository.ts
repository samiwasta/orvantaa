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
}): AuthUserRecord {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    role: mapPrismaRoleToAppRole(row.role),
    passwordHash: row.passwordHash,
  }
}

export class AuthUserRepository {
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
}

export const authUserRepository = new AuthUserRepository()
