import { prisma } from "@/lib/db"

import {
  type CreateUserInput,
  formatClassLabel,
  mapAppRoleToPrismaRole,
  mapPrismaGenderToUserGender,
  mapPrismaRoleToAppRole,
  mapPrismaUserToUser,
  mapUserGenderToPrismaGender,
  type User,
} from "../model/user"

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } })
    return row ? mapPrismaUserToUser(row) : null
  }

  async findDashboardProfileById(
    id: string
  ): Promise<{ user: User; classLabel: string | null } | null> {
    const row = await prisma.user.findUnique({
      where: { id },
      include: { class: true },
    })
    if (!row) {
      return null
    }

    const role = mapPrismaRoleToAppRole(row.role)
    const classLabel =
      role === "student" && row.class
        ? formatClassLabel(row.class.name, row.class.section)
        : null

    return {
      user: mapPrismaUserToUser(row),
      classLabel,
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    })
    return row ? mapPrismaUserToUser(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })
    return row ? mapPrismaUserToUser(row) : null
  }

  async findFirst(): Promise<User | null> {
    const row = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } })
    return row ? mapPrismaUserToUser(row) : null
  }

  async create(input: CreateUserInput): Promise<User> {
    const row = await prisma.user.create({
      data: {
        username: input.username.trim().toLowerCase(),
        email: input.email.trim().toLowerCase(),
        passwordHash: input.passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        gender: mapUserGenderToPrismaGender(input.gender),
        role: mapAppRoleToPrismaRole(input.role ?? "student"),
      },
    })
    return mapPrismaUserToUser(row)
  }
}

export const userRepository = new UserRepository()
