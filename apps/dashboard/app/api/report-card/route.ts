import { NextResponse } from "next/server"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { parseSaveReportCard } from "@/features/performance/model/report-card-request"
import { reportCardRepository } from "@/features/performance/repository/report-card.repository"
import { requireStudentSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const authSession = await requireStudentSession()
    const classId = await loadStudentClassId()

    const reportCard = await reportCardRepository.getReportCardForUser(
      authSession.sub,
      classId ?? ""
    )

    return NextResponse.json({ reportCard })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }
    return NextResponse.json(
      { error: "Could not load report card." },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authSession = await requireStudentSession()
    const classId = await loadStudentClassId()
    if (!classId) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const parsed = parseSaveReportCard(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid report card data." },
        { status: 400 }
      )
    }

    const reportCard = await reportCardRepository.saveReportCardForUser(
      authSession.sub,
      classId,
      parsed.data
    )

    return NextResponse.json({ reportCard })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const message =
      error instanceof Error ? error.message : "Could not save report card."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
