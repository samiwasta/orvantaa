import { NextResponse } from "next/server"

import { parseEndProctorSession } from "@/features/proctoring/model/proctor-request"
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

    const parsed = parseEndProctorSession(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reason." }, { status: 400 })
    }

    const session = await proctorService.endSession(
      authSession.sub,
      sessionId,
      parsed.data.reason
    )
    if (!session) {
      return NextResponse.json(
        { error: "Proctoring session not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ session })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message === "Forbidden")
    ) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Could not end the proctored attempt." },
      { status: 400 }
    )
  }
}
