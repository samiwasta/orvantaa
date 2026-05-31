import { cache } from "react"

import { boardService } from "../service/board.service"

export const loadBoards = cache(async () => {
  const boards = await boardService.listBoards()
  return { boards, total: boards.length }
})
