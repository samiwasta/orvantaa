import { cache } from "react"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadSubjectChapters = cache(async (subjectSlug: string) => {
  const classId = await loadStudentClassId()
  if (!classId) return null

  const subject = await curriculumService.getSubject(classId, subjectSlug)
  if (!subject) return null

  const chapters = await curriculumService.listChapters(classId, subjectSlug)
  if (!chapters?.length) return null

  return { subject, chapters }
})
