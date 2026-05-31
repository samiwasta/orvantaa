import { cache } from "react"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadQuizPage = cache(
  async (subjectSlug: string, chapterSlug: string, quizId: string) => {
    const classId = await loadStudentClassId()
    if (!classId) return null

    return curriculumService.getQuizPage(
      classId,
      subjectSlug,
      chapterSlug,
      quizId
    )
  }
)
