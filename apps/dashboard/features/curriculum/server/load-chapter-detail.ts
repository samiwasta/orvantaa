import { cache } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"

import { curriculumService } from "../service/curriculum.service"
import { loadStudentClassId } from "./load-student-class-id"

export const loadChapterDetail = cache(
  async (subjectSlug: string, chapterSlug: string) => {
    const session = await getAuthSession()
    const classId = await loadStudentClassId()
    if (!classId || !session) return null

    return curriculumService.getChapterDetail(
      classId,
      subjectSlug,
      chapterSlug,
      session.sub
    )
  }
)
