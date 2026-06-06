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
  type UserGender,
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
      include: { section: { include: { class: true } } },
    })
    if (!row) {
      return null
    }

    const role = mapPrismaRoleToAppRole(row.role)
    const classLabel =
      role === "student" && row.section
        ? formatClassLabel(row.section.class.name, row.section.name)
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

  async findProfilePageDataById(id: string): Promise<
    | (User & {
        phone: string | null
      })
    | null
  > {
    const row = await prisma.user.findUnique({ where: { id } })
    if (!row) return null

    return {
      ...mapPrismaUserToUser(row),
      phone: row.phone,
    }
  }

  async isUsernameTakenByOtherUser(
    username: string,
    excludeUserId: string
  ): Promise<boolean> {
    const row = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
      select: { id: true },
    })
    return Boolean(row && row.id !== excludeUserId)
  }

  async isEmailTakenByOtherUser(
    email: string,
    excludeUserId: string
  ): Promise<boolean> {
    const row = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    })
    return Boolean(row && row.id !== excludeUserId)
  }

  async updateProfile(
    userId: string,
    input: {
      firstName: string
      lastName: string
      username: string
      email: string
      phone: string | null
      gender: UserGender
    }
  ): Promise<User> {
    const row = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        username: input.username.trim().toLowerCase(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone,
        gender: mapUserGenderToPrismaGender(input.gender),
      },
    })
    return mapPrismaUserToUser(row)
  }

  async getPasswordHash(userId: string): Promise<string | null> {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    })
    return row?.passwordHash ?? null
  }
}

export const userRepository = new UserRepository()
