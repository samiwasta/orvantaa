import bcrypt from "bcryptjs"

import { authUserRepository } from "@/features/auth/repository/auth-user.repository"
import { isSuperAdminUsername } from "@/lib/auth/super-admin"

import type { ProfilePageData, ProfilePasswordInput, ProfileUpdateInput } from "../model/profile"
import { profilePasswordSchema, profileUpdateSchema } from "../model/profile"
import { type DashboardUserProfile, formatUserFullName } from "../model/user"
import {
  type UserRepository,
  userRepository,
} from "../repository/user.repository"

export class UserService {
  constructor(private readonly repository: UserRepository = userRepository) {}

  async getDashboardProfile(userId: string): Promise<DashboardUserProfile> {
    const record = await this.repository.findDashboardProfileById(userId)

    if (!record) {
      throw new Error("No user found for dashboard profile")
    }

    const firstName = record.user.firstName ?? ""
    const lastName = record.user.lastName ?? ""

    return {
      firstName,
      lastName,
      fullName: formatUserFullName(firstName, lastName),
      gender: record.user.gender,
      role: record.user.role,
      classLabel: record.classLabel,
    }
  }

  async getUserByUsername(username: string) {
    return this.repository.findByUsername(username)
  }

  async getUserByEmail(email: string) {
    return this.repository.findByEmail(email)
  }

  async getProfilePageData(userId: string): Promise<ProfilePageData> {
    const record = await this.repository.findProfilePageDataById(userId)
    if (!record) {
      throw new Error("No user found for profile")
    }

    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      username: record.username,
      email: record.email,
      phone: record.phone,
      gender: record.gender,
      role: record.role,
      isSuperAdmin: isSuperAdminUsername(record.username),
    }
  }

  async updateProfile(userId: string, raw: unknown): Promise<ProfilePageData> {
    const parsed = profileUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile data")
    }

    const input = parsed.data
    const current = await this.repository.findProfilePageDataById(userId)
    if (!current) {
      throw new Error("No user found for profile")
    }

    const isSuperAdmin = isSuperAdminUsername(current.username)
    const username = isSuperAdmin ? current.username : input.username

    if (!isSuperAdmin && username !== current.username) {
      if (await this.repository.isUsernameTakenByOtherUser(username, userId)) {
        throw new Error("Username is already taken.")
      }
    }

    if (input.email !== current.email) {
      if (await this.repository.isEmailTakenByOtherUser(input.email, userId)) {
        throw new Error("Email is already registered.")
      }
    }

    await this.repository.updateProfile(userId, {
      firstName: input.firstName,
      lastName: input.lastName ?? "",
      username,
      email: input.email,
      phone: input.phone?.trim() ? input.phone.trim() : null,
      gender: input.gender,
    })

    return this.getProfilePageData(userId)
  }

  async changePassword(userId: string, raw: unknown): Promise<void> {
    const parsed = profilePasswordSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid password data")
    }

    await this.applyPasswordChange(userId, parsed.data)
  }

  private async applyPasswordChange(
    userId: string,
    input: ProfilePasswordInput
  ): Promise<void> {
    const passwordHash = await this.repository.getPasswordHash(userId)
    if (!passwordHash) {
      throw new Error("User not found.")
    }

    const matches = await bcrypt.compare(input.currentPassword, passwordHash)
    if (!matches) {
      throw new Error("Current password is incorrect.")
    }

    const nextHash = await bcrypt.hash(input.newPassword, 10)
    await authUserRepository.updatePasswordHash(userId, nextHash)
  }
}

export const userService = new UserService()
