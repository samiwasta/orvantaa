import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentSubjects = cache(async (classId: string) => {
  const classRef = await contentService.getClassRef(classId)
  if (!classRef) return null
  const subjects = await contentService.listSubjectsForClass(classId)
  return { classRef, subjects }
})
