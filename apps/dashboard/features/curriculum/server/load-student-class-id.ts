import { cache } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"
import { prisma } from "@/lib/db"

export const loadStudentClassId = cache(async (): Promise<string | null> => {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  const row = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { section: { select: { classId: true } } },
  })

  return row?.section?.classId ?? null
})
