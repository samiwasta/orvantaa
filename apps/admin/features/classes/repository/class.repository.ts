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
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            board: { select: { name: true } },
          },
        },
        sections: {
          select: {
            name: true,
            _count: { select: { students: true } },
          },
        },
        _count: { select: { subjects: true } },
      },
    })

    const items: ClassListItem[] = rows.map((row) => ({
      id: row.id,
      schoolId: row.school.id,
      className: row.name,
      classDisplayName: formatClassDisplayName(row.name),
      sectionNames: row.sections
        .map((section) => section.name.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      schoolName: row.school.name,
      schoolCode: formatSchoolCodeForClass(row.school.code, row.school.id),
      boardName: row.school.board.name,
      studentCount: row.sections.reduce(
        (sum, section) => sum + section._count.students,
        0
      ),
      subjectCount: row._count.subjects,
    }))

    return items.sort(compareClassListItems)
  }
}

export const classRepository = new ClassRepository()
