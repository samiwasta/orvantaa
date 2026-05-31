import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentTopicDetail = cache(async (topicId: string) => {
  const topicRef = await contentService.getTopicDetailRef(topicId)
  if (!topicRef) return null
  const notes = await contentService.listNotesForTopic(topicId)
  return { topicRef, notes }
})
