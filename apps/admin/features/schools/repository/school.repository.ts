import { prisma } from "@/lib/db"

import {
  formatBoardKindLabel,
  formatSchoolDisplayCode,
  mapPrismaBoardKind,
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
        boardName: row.board.name,
        boardKind,
        boardKindLabel: formatBoardKindLabel(boardKind),
        classCount: row._count.classes,
        studentCount,
      }
    })
  }
}

export const schoolRepository = new SchoolRepository()
