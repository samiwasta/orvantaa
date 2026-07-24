import { mapPrismaRoleToAppRole } from "@/features/user/model/user"
import { prisma } from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma"

import { EmailAlreadyRegisteredError } from "../model/auth-errors"
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
  onboardingCompleted: boolean
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
    onboardingCompleted: row.onboardingCompleted,
  }
}

export type CreateIndividualStudentInput = {
  username: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: Date
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

  async createIndividualStudent(
    input: CreateIndividualStudentInput
  ): Promise<AuthUserRecord> {
    try {
      const row = await prisma.user.create({
        data: {
          username: input.username,
          email: input.email,
          passwordHash: input.passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          dateOfBirth: input.dateOfBirth,
          role: "STUDENT",
          mustChangePassword: false,
          onboardingCompleted: false,
          sectionId: null,
        },
      })
      return mapRow(row)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new EmailAlreadyRegisteredError()
      }
      throw error
    }
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
