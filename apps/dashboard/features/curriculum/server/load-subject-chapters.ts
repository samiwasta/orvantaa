import { cache } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadSubjectChapters = cache(async (subjectSlug: string) => {
  const session = await getAuthSession()
  const classId = await loadStudentClassId()
  if (!classId || !session) return null

  const subject = await curriculumService.getSubject(
    classId,
    subjectSlug,
    session.sub
  )
  if (!subject) return null

  const chapters = await curriculumService.listChapters(
    classId,
    subjectSlug,
    session.sub
  )
  if (!chapters?.length) return null

  return { subject, chapters }
})
