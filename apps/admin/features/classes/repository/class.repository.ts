import { prisma } from "@/lib/db"

import {
  compareClassListItems,
  formatClassDisplayName,
  formatSchoolCodeForClass,
  type ClassListItem,
} from "../model/class-list-item"

export class ClassRepository {
  async findAllClasses(): Promise<ClassListItem[]> {
    const rows = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        section: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            board: { select: { name: true } },
          },
        },
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    })

    const items: ClassListItem[] = rows.map((row) => ({
      id: row.id,
      schoolId: row.school.id,
      className: row.name,
      classDisplayName: formatClassDisplayName(row.name),
      section: row.section?.trim() || null,
      schoolName: row.school.name,
      schoolCode: formatSchoolCodeForClass(row.school.code, row.school.id),
      boardName: row.school.board.name,
      studentCount: row._count.students,
      subjectCount: row._count.subjects,
    }))

    return items.sort(compareClassListItems)
  }
}

export const classRepository = new ClassRepository()
