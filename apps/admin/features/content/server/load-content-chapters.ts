import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentChapters = cache(async (subjectId: string) => {
  const subjectRef = await contentService.getSubjectRef(subjectId)
  if (!subjectRef) return null
  const chapters = await contentService.listChaptersForSubject(subjectId)
  return { subjectRef, chapters }
})
