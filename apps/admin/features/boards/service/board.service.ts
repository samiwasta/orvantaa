import type { BoardInput, BoardListItem } from "../model/board-list-item"
import {
  type BoardRepository,
  boardRepository,
} from "../repository/board.repository"

export class BoardService {
  constructor(
    private readonly repository: BoardRepository = boardRepository
  ) {}

  async listBoards(): Promise<BoardListItem[]> {
    return this.repository.findAllBoards()
  }

  async createBoard(input: BoardInput): Promise<BoardListItem> {
    return this.repository.createBoard(input)
  }

  async updateBoard(id: string, input: BoardInput): Promise<BoardListItem> {
    return this.repository.updateBoard(id, input)
  }

  async deleteBoard(id: string): Promise<void> {
    const schoolCount = await this.repository.countSchools(id)
    if (schoolCount > 0) {
      throw new Error(
        `Cannot delete a board with ${schoolCount} school${schoolCount === 1 ? "" : "s"}. Reassign or remove them first.`
      )
    }
    await this.repository.deleteBoard(id)
  }
}

export const boardService = new BoardService()
