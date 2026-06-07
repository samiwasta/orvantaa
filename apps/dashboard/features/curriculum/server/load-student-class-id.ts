import { cache } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"
import { prisma } from "@/lib/db"

export type StudentClassContext = {
  classId: string
  schoolId: string
}

export const loadStudentClassId = cache(async (): Promise<string | null> => {
  const context = await loadStudentClassContext()
  return context?.classId ?? null
})

export const loadStudentClassContext = cache(
  async (): Promise<StudentClassContext | null> => {
    const session = await getAuthSession()
    if (!session) {
      throw new Error("Unauthorized")
    }

    const row = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        section: {
          select: {
            class: {
              select: { id: true, schoolId: true },
            },
          },
        },
      },
    })

    const classRef = row?.section?.class
    if (!classRef) return null

    return {
      classId: classRef.id,
      schoolId: classRef.schoolId,
    }
  }
)
