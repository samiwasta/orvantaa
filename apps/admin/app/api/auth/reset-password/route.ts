import { NextResponse } from "next/server"

import { InvalidResetTokenError } from "@/features/auth/model/auth-errors"
import { resetPasswordApiSchema } from "@/features/auth/model/schemas"
import { authService } from "@/features/auth/service/auth.service"

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

  const parsed = resetPasswordApiSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  try {
    await authService.resetPassword(parsed.data.token, parsed.data.newPassword)
    return NextResponse.json({ message: "Password updated successfully." })
  } catch (error) {
    if (error instanceof InvalidResetTokenError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error("[reset-password] error:", error)
    return NextResponse.json(
      { message: "Could not reset your password. Please try again." },
      { status: 500 }
    )
  }
}
