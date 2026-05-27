export type PasswordResetToken = {
  id: string
  userId: string
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

export type CreatePasswordResetTokenInput = {
  userId: string
  tokenHash: string
  expiresAt: Date
}
