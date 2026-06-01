import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentBoards = cache(async () => {
  const boards = await contentService.listBoards()
  return { boards, total: boards.length }
})
