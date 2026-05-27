import { NextResponse } from "next/server"

import { InvalidCredentialsError } from "@/features/auth/model/auth-errors"
import { loginSchema } from "@/features/auth/model/schemas"
import { authService } from "@/features/auth/service/auth.service"
import { setAuthCookie } from "@/lib/auth/cookies"

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

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const rememberMe =
    typeof body === "object" &&
    body !== null &&
    "rememberMe" in body &&
    body.rememberMe === true

  try {
    const result = await authService.login(
      parsed.data.username,
      parsed.data.password,
      rememberMe
    )

    const response = NextResponse.json({ user: result.user })
    setAuthCookie(response, result.accessToken, rememberMe)
    return response
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    console.error("Login failed:", error)
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed." }, { status: 405 })
}
