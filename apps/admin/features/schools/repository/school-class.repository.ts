import {
  formatClassDisplayName,
  parseClassLevel,
} from "@/features/classes/model/class-list-item"
import { prisma } from "@/lib/db"

import type { BoardClassOption } from "../model/board-class-option"

export class SchoolClassRepository {
  async findBoardClassOptions(
    boardId: string,
    schoolId: string
  ): Promise<BoardClassOption[]> {
    const [boardClassRows, schoolClassRows] = await Promise.all([
      prisma.class.findMany({
        where: { school: { boardId } },
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

    const byNormalized = new Map<string, string>()
    for (const row of boardClassRows) {
      const trimmed = row.name.trim()
      if (!trimmed) continue
      const key = trimmed.toLowerCase()
      if (!byNormalized.has(key)) {
        byNormalized.set(key, trimmed)
      }
    }

    return [...byNormalized.values()]
      .filter((name) => !existingNames.has(name.toLowerCase()))
      .sort((a, b) => {
        const levelA = parseClassLevel(a)
        const levelB = parseClassLevel(b)
        if (levelA !== levelB) return levelA - levelB
        return a.localeCompare(b, undefined, { numeric: true })
      })
      .map((name) => ({
        name,
        displayName: formatClassDisplayName(name),
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
