import { NextResponse } from "next/server"

import { changePasswordApiSchema } from "@/features/auth/model/schemas"
import { authService } from "@/features/auth/service/auth.service"
import { clearAuthCookie } from "@/lib/auth/cookies"
import { sessionMustChangePassword } from "@/lib/auth/middleware-auth"
import { requireStudentSession } from "@/lib/auth/session"

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

  const parsed = changePasswordApiSchema.safeParse(body)
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
    const session = await requireStudentSession()
    if (!sessionMustChangePassword(session)) {
      return NextResponse.json(
        { message: "Password change is not required." },
        { status: 403 }
      )
    }

    await authService.changePassword(session.sub, parsed.data.newPassword)

    const response = NextResponse.json({
      message: "Password updated successfully.",
    })
    clearAuthCookie(response)
    return response
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update your password."
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    }
    console.error("[change-password] error:", error)
    return NextResponse.json(
      { message: "Could not update your password. Please try again." },
      { status: 500 }
    )
  }
}
