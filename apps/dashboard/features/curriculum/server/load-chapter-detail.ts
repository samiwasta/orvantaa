import { cache } from "react"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadChapterDetail = cache(
  async (subjectSlug: string, chapterSlug: string) => {
    const classId = await loadStudentClassId()
    if (!classId) return null

    return curriculumService.getChapterDetail(classId, subjectSlug, chapterSlug)
  }
)
