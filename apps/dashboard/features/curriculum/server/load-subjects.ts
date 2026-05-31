import { cache } from "react"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadSubjects = cache(async () => {
  const classId = await loadStudentClassId()
  if (!classId) return []
  return curriculumService.listSubjects(classId)
})
