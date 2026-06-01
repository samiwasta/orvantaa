import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentBoardClasses = cache(async (boardId: string) => {
  const [board, classes] = await Promise.all([
    contentService.getBoardRef(boardId),
    contentService.listClassesForBoard(boardId),
  ])
  if (!board) return null
  return { board, classes }
})
