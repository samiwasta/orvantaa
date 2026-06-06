import {
  formatClassDisplayName,
  parseClassLevel,
} from "@/features/classes/model/class-list-item"
import { prisma } from "@/lib/db"

import type { BoardClassOption } from "../model/board-class-option"

export class SchoolClassRepository {
  async findBoardClassOptions(
    _boardId: string,
    schoolId: string
  ): Promise<BoardClassOption[]> {
    const [platformClasses, schoolClassRows] = await Promise.all([
      prisma.platformClass.findMany({
        orderBy: { name: "asc" },
        select: { name: true },
      }),
      prisma.class.findMany({
        where: { schoolId },
        select: { name: true },
      }),
    ])

    const existingNames = new Set(
      schoolClassRows.map((row) => row.name.trim().toLowerCase())
    )

    return platformClasses
      .filter((row) => !existingNames.has(row.name.trim().toLowerCase()))
      .sort((a, b) => {
        const levelA = parseClassLevel(a.name)
        const levelB = parseClassLevel(b.name)
        if (levelA !== levelB) return levelA - levelB
        return a.name.localeCompare(b.name, undefined, { numeric: true })
      })
      .map((row) => ({
        name: row.name,
        displayName: formatClassDisplayName(row.name),
      }))
  }

  async createClasses(schoolId: string, names: string[]): Promise<void> {
    await prisma.$transaction(
      names.map((name) =>
        prisma.class.create({
          data: { schoolId, name: name.trim() },
        })
      )
    )
  }
}

export const schoolClassRepository = new SchoolClassRepository()
