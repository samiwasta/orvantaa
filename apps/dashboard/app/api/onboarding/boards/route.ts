import { NextResponse } from "next/server"

import { onboardingService } from "@/features/onboarding/service/onboarding.service"
import { requireStudentSession } from "@/lib/auth/session"

export async function GET() {
  try {
    await requireStudentSession()
    const boards = await onboardingService.listBoards()
    return NextResponse.json({ boards })
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }
}
