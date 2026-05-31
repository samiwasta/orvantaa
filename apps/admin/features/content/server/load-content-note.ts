import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentNote = cache(async (noteId: string) => {
  const note = await contentService.getNote(noteId)
  if (!note) return null
  const topicRef = await contentService.getTopicDetailRef(note.topicId)
  if (!topicRef) return null
  return { note, topicRef }
})
