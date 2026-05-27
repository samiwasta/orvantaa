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
}

export const userService = new UserService()
