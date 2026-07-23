import { NextResponse } from "next/server"

import { EmailAlreadyRegisteredError } from "@/features/auth/model/auth-errors"
import {
  fieldErrorsFromZod,
  registerSchema,
} from "@/features/auth/model/schemas"
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

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      },
      { status: 422 }
    )
  }

  try {
    const result = await authService.registerIndividual(parsed.data)
    const response = NextResponse.json({
      user: result.user,
    })
    setAuthCookie(response, result.accessToken, false)
    return response
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return NextResponse.json(
        {
          message: error.message,
          fieldErrors: { email: error.message },
        },
        { status: 409 }
      )
    }
    console.error("Registration failed:", error)
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed." }, { status: 405 })
}
