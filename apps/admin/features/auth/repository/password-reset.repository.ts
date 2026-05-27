import { prisma } from "@/lib/db"

import type {
  CreatePasswordResetTokenInput,
  PasswordResetToken,
} from "../model/password-reset-token"

function mapRow(row: {
  id: string
  userId: string
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}): PasswordResetToken {
  return {
    id: row.id,
    userId: row.userId,
    expiresAt: row.expiresAt,
    usedAt: row.usedAt,
    createdAt: row.createdAt,
  }
}

export class PasswordResetRepository {
  async create(
    input: CreatePasswordResetTokenInput
  ): Promise<PasswordResetToken> {
    const row = await prisma.passwordResetToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    })
    return mapRow(row)
  }

  async findValidByTokenHash(
    tokenHash: string
  ): Promise<PasswordResetToken | null> {
    const row = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    })
    return row ? mapRow(row) : null
  }

  async markUsed(id: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    })
  }

  async invalidateActiveForUser(userId: string): Promise<void> {
    await prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    })
  }
}

export const passwordResetRepository = new PasswordResetRepository()
