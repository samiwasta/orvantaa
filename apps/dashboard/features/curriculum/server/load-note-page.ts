import { cache } from "react"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadNotePage = cache(
  async (
    subjectSlug: string,
    chapterSlug: string,
    topicSlug: string,
    noteId: string
  ) => {
    const classId = await loadStudentClassId()
    if (!classId) return null

    return curriculumService.getNotePage(
      classId,
      subjectSlug,
      chapterSlug,
      topicSlug,
      noteId
    )
  }
)
