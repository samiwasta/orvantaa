import { cache } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadSubjects = cache(async () => {
  const session = await getAuthSession()
  const classId = await loadStudentClassId()
  if (!classId || !session) return []
  return curriculumService.listSubjects(classId, session.sub)
})
