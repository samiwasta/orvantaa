import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentTopics = cache(async (chapterId: string) => {
  const chapterRef = await contentService.getChapterRef(chapterId)
  if (!chapterRef) return null
  const topics = await contentService.listTopicsForChapter(chapterId)
  return { chapterRef, topics }
})
