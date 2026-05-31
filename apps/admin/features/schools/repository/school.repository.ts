import { prisma } from "@/lib/db"

import {
  type BoardOption,
  formatBoardKindLabel,
  formatSchoolDisplayCode,
  mapPrismaBoardKind,
  type SchoolInput,
  type SchoolListItem,
} from "../model/school-list-item"

export class SchoolRepository {
  async findAllSchools(): Promise<SchoolListItem[]> {
    const rows = await prisma.school.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        boardId: true,
        board: {
          select: {
            name: true,
            kind: true,
          },
        },
        classes: {
          select: {
            sections: {
              select: { _count: { select: { students: true } } },
            },
          },
        },
        _count: { select: { classes: true } },
      },
    })

    return rows.map((row) => {
      const boardKind = mapPrismaBoardKind(row.board.kind)
      const studentCount = row.classes.reduce(
        (sum, cls) =>
          sum +
          cls.sections.reduce(
            (sectionSum, section) => sectionSum + section._count.students,
            0
          ),
        0
      )

      return {
        id: row.id,
        schoolCode: formatSchoolDisplayCode(row.code, row.id),
        name: row.name,
        code: row.code,
        boardId: row.boardId,
        boardName: row.board.name,
        boardKind,
        boardKindLabel: formatBoardKindLabel(boardKind),
        classCount: row._count.classes,
        studentCount,
      }
    })
  }

  async findBoardOptions(): Promise<BoardOption[]> {
    const rows = await prisma.board.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, kind: true },
    })
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      kindLabel: formatBoardKindLabel(mapPrismaBoardKind(row.kind)),
    }))
  }

  async createSchool(input: SchoolInput): Promise<void> {
    await prisma.school.create({
      data: {
        name: input.name,
        code: input.code ?? null,
        boardId: input.boardId,
      },
    })
  }

  async updateSchool(id: string, input: SchoolInput): Promise<void> {
    await prisma.school.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code ?? null,
        boardId: input.boardId,
      },
    })
  }

  async deleteSchool(id: string): Promise<void> {
    await prisma.school.delete({ where: { id } })
  }

  async countClasses(id: string): Promise<number> {
    return prisma.class.count({ where: { schoolId: id } })
  }
}

export const schoolRepository = new SchoolRepository()
