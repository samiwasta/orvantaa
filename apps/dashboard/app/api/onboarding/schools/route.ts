import { NextResponse } from "next/server"

import { onboardingService } from "@/features/onboarding/service/onboarding.service"
import { requireStudentSession } from "@/lib/auth/session"

export async function GET(request: Request) {
  try {
    await requireStudentSession()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() ?? ""
    const schools = await onboardingService.searchSchools(q)
    return NextResponse.json({ schools })
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }
}
