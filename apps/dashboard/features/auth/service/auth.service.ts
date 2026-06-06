import bcrypt from "bcryptjs"
import { createHash } from "crypto"

import {
  isSchoolSubscriptionAccessAllowed,
  subscriptionAccessMessage,
} from "@/features/schools/model/school-subscription"
import {
  type SchoolSubscriptionService,
  schoolSubscriptionService,
} from "@/features/schools/service/school-subscription.service"
import { signAccessToken } from "@/lib/auth/jwt"

import {
  InvalidCredentialsError,
  InvalidResetTokenError,
  SchoolSubscriptionBlockedError,
} from "../model/auth-errors"
import { type LoginResult, toSafeAuthUser } from "../model/auth-session"
import {
  type AuthUserRepository,
  authUserRepository,
} from "../repository/auth-user.repository"
import {
  type PasswordResetRepository,
  passwordResetRepository,
} from "../repository/password-reset.repository"

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export class AuthService {
  constructor(
    private readonly authUsers: AuthUserRepository = authUserRepository,
    private readonly passwordResets: PasswordResetRepository = passwordResetRepository,
    private readonly subscriptions: SchoolSubscriptionService = schoolSubscriptionService
  ) {}

  async login(
    identifier: string,
    password: string,
    rememberMe = false
  ): Promise<LoginResult> {
    const user = await this.authUsers.findByUsernameOrEmail(identifier)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    if (user.role !== "student") {
      throw new InvalidCredentialsError()
    }

    const access = await this.subscriptions.getStudentSchoolAccess(user.id)
    if (!isSchoolSubscriptionAccessAllowed(access.status)) {
      if (
        access.status === "inactive" ||
        access.status === "hold" ||
        access.status === "blocked"
      ) {
        throw new SchoolSubscriptionBlockedError(
          access.status,
          subscriptionAccessMessage(access.status)
        )
      }
    }

    const accessToken = await signAccessToken(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      rememberMe
    )

    return {
      accessToken,
      user: toSafeAuthUser(user),
      mustChangePassword: user.mustChangePassword,
    }
  }

  async findUserByUsername(username: string) {
    const record = await this.authUsers.findByUsernameOrEmail(username)
    return record ? toSafeAuthUser(record) : null
  }

  async findUserByEmail(email: string) {
    const record = await this.authUsers.findByUsernameOrEmail(email)
    return record ? toSafeAuthUser(record) : null
  }

  async createPasswordResetToken(userId: string, tokenHash: string) {
    await this.passwordResets.invalidateActiveForUser(userId)
    return this.passwordResets.create({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    })
  }

  async validatePasswordResetToken(tokenHash: string) {
    return this.passwordResets.findValidByTokenHash(tokenHash)
  }

  async consumePasswordResetToken(tokenId: string) {
    await this.passwordResets.markUsed(tokenId)
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex")
    const token = await this.validatePasswordResetToken(tokenHash)
    if (!token) {
      throw new InvalidResetTokenError()
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await this.authUsers.updatePasswordHash(token.userId, passwordHash, {
      clearMustChangePassword: true,
    })
    await this.consumePasswordResetToken(token.id)
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.authUsers.findById(userId)
    if (user?.role !== "student") {
      throw new Error("Unauthorized")
    }
    if (!user.mustChangePassword) {
      throw new Error("Password change is not required.")
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await this.authUsers.updatePasswordHash(userId, passwordHash, {
      clearMustChangePassword: true,
    })
  }
}

export const authService = new AuthService()
