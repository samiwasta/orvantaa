import { NextResponse } from "next/server"

import { parseRecordProctorViolation } from "@/features/proctoring/model/proctor-request"
import { proctorService } from "@/features/proctoring/service/proctor.service"
import { requireStudentSession } from "@/lib/auth/session"

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authSession = await requireStudentSession()
    const { sessionId } = await context.params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const parsed = parseRecordProctorViolation(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid proctoring event." },
        { status: 400 }
      )
    }

    const violation = await proctorService.recordViolation(
      authSession.sub,
      sessionId,
      parsed.data
    )
    if (!violation) {
      return NextResponse.json(
        { error: "Proctoring session not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ violation })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message === "Forbidden")
    ) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Could not record proctoring activity." },
      { status: 400 }
    )
  }
}
