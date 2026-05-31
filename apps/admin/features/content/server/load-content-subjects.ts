import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentSubjects = cache(
  async (classNameParam: string) => {
    const result = await contentService.listSubjectsForClassGrade(classNameParam)
    return result
  }
)
