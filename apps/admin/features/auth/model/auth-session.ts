import type { AppUserRole } from "@/features/user/model/user"

export type AuthUserRecord = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: AppUserRole
  passwordHash: string
}

export type SafeAuthUser = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: AppUserRole
}

export type LoginResult = {
  accessToken: string
  user: SafeAuthUser
}

export function toSafeAuthUser(record: AuthUserRecord): SafeAuthUser {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    firstName: record.firstName,
    lastName: record.lastName,
    role: record.role,
  }
}
