import { createHash, randomBytes } from "crypto"
import { NextResponse } from "next/server"

import { forgotPasswordSchema } from "@/features/auth/model/schemas"
import { authService } from "@/features/auth/service/auth.service"
import { authEmailService } from "@/features/auth/service/email.service"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    )
  }

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { email } = parsed.data

  try {
    const user = await authService.findUserByEmail(email)

    if (user) {
      const rawToken = randomBytes(32).toString("hex")
      const tokenHash = createHash("sha256").update(rawToken).digest("hex")

      await authService.createPasswordResetToken(user.id, tokenHash)

      const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`

      await authEmailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetUrl
      )
    }
  } catch (error) {
    console.error("[forgot-password] error:", error)
  }

  return NextResponse.json({
    message:
      "If that email is registered, you'll receive a reset link shortly.",
  })
}
