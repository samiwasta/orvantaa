import type { Gender, User as PrismaUser, UserRole } from "@prisma/client"

import type { UserGender } from "@/features/sidebar/model/user-gender"

export type AppUserRole = "admin" | "student"

export type User = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  gender: UserGender
  role: AppUserRole
  createdAt: Date
  updatedAt: Date
}

export type DashboardUserProfile = {
  firstName: string
  lastName: string
  fullName: string
  gender: UserGender
  role: AppUserRole
  classLabel: string | null
}

export type CreateUserInput = {
  username: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  gender: UserGender
  role?: AppUserRole
}

export function formatUserFullName(
  firstName: string | null | undefined,
  lastName?: string | null | undefined
): string {
  return [firstName?.trim() ?? "", lastName?.trim() ?? ""]
    .filter(Boolean)
    .join(" ")
}

export function formatRoleLabel(role: AppUserRole): string {
  return role === "admin" ? "Admin" : "Student"
}

export function formatClassLabel(
  className: string,
  section?: string | null
): string {
  const trimmed = className.trim()
  const base = /^class\s/i.test(trimmed) ? trimmed : `Class ${trimmed}`
  return section?.trim() ? `${base} - ${section.trim()}` : base
}

export function mapPrismaGenderToUserGender(gender: Gender): UserGender {
  return gender === "MALE" ? "male" : "female"
}

export function mapUserGenderToPrismaGender(gender: UserGender): Gender {
  return gender === "male" ? "MALE" : "FEMALE"
}

export function mapPrismaRoleToAppRole(role: UserRole): AppUserRole {
  return role === "ADMIN" ? "admin" : "student"
}

export function mapAppRoleToPrismaRole(role: AppUserRole): UserRole {
  return role === "admin" ? "ADMIN" : "STUDENT"
}

export function mapPrismaUserToUser(row: PrismaUser): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    gender: mapPrismaGenderToUserGender(row.gender),
    role: mapPrismaRoleToAppRole(row.role),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
