import { prisma } from "@/lib/db"

import {
  type BoardInput,
  type BoardListItem,
  formatBoardKindLabel,
  mapBoardKindToPrisma,
  mapPrismaBoardKind,
} from "../model/board-list-item"

function toListItem(row: {
  id: string
  name: string
  slug: string
  kind: "BOARD" | "UNIVERSITY"
  code: string | null
  _count: { schools: number }
}): BoardListItem {
  const kind = mapPrismaBoardKind(row.kind)
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    kind,
    kindLabel: formatBoardKindLabel(kind),
    code: row.code,
    schoolCount: row._count.schools,
  }
}

export class BoardRepository {
  async findAllBoards(): Promise<BoardListItem[]> {
    const rows = await prisma.board.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        kind: true,
        code: true,
        _count: { select: { schools: true } },
      },
    })
    return rows.map(toListItem)
  }

  async createBoard(input: BoardInput): Promise<BoardListItem> {
    const row = await prisma.board.create({
      data: {
        name: input.name,
        slug: input.slug,
        kind: mapBoardKindToPrisma(input.kind),
        code: input.code ?? null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        kind: true,
        code: true,
        _count: { select: { schools: true } },
      },
    })
    return toListItem(row)
  }

  async updateBoard(id: string, input: BoardInput): Promise<BoardListItem> {
    const row = await prisma.board.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        kind: mapBoardKindToPrisma(input.kind),
        code: input.code ?? null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        kind: true,
        code: true,
        _count: { select: { schools: true } },
      },
    })
    return toListItem(row)
  }

  async deleteBoard(id: string): Promise<void> {
    await prisma.board.delete({ where: { id } })
  }

  async countSchools(id: string): Promise<number> {
    return prisma.school.count({ where: { boardId: id } })
  }
}

export const boardRepository = new BoardRepository()
