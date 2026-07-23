import { NextResponse } from "next/server"

import {
  fieldErrorsFromZod,
  onboardingSchema,
} from "@/features/onboarding/model/schemas"
import { onboardingService } from "@/features/onboarding/service/onboarding.service"
import { mapPrismaRoleToAppRole } from "@/features/user/model/user"
import { setAuthCookie } from "@/lib/auth/cookies"
import { signAccessToken } from "@/lib/auth/jwt"
import { requireStudentSession } from "@/lib/auth/session"

export async function POST(request: Request) {
  let session
  try {
    session = await requireStudentSession()
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    )
  }

  const parsed = onboardingSchema.safeParse(body)
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
    const result = await onboardingService.completeOnboarding({
      userId: session.sub,
      schoolId: parsed.data.schoolId,
      schoolName: parsed.data.schoolName,
      boardId: parsed.data.boardId,
      city: parsed.data.city,
      state: parsed.data.state,
      standard: parsed.data.standard,
      section: parsed.data.section,
    })

    const accessToken = await signAccessToken({
      sub: result.user.id,
      username: result.user.username,
      role: mapPrismaRoleToAppRole(result.user.role),
      mustChangePassword: result.user.mustChangePassword,
      needsOnboarding: !result.user.onboardingCompleted,
    })

    const response = NextResponse.json({ ok: true })
    setAuthCookie(response, accessToken, false)
    return response
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BOARD_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Selected board was not found.",
            fieldErrors: { boardId: "Selected board was not found." },
          },
          { status: 422 }
        )
      }
      if (error.message === "SCHOOL_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Selected school was not found.",
            fieldErrors: { schoolName: "Selected school was not found." },
          },
          { status: 422 }
        )
      }
    }
    console.error("Onboarding failed:", error)
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
