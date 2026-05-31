import { prisma } from "@/lib/db"

import {
  type ClassInput,
  type ClassListItem,
  compareClassListItems,
  formatClassDisplayName,
  formatSchoolCodeForClass,
  type SchoolOption,
  type SectionInput,
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
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            _count: { select: { students: true } },
          },
        },
        _count: { select: { subjects: true } },
      },
    })

    const items: ClassListItem[] = rows.map((row) => {
      const sections = row.sections.map((section) => ({
        id: section.id,
        name: section.name,
        studentCount: section._count.students,
      }))

      return {
        id: row.id,
        schoolId: row.school.id,
        className: row.name,
        classDisplayName: formatClassDisplayName(row.name),
        sections,
        schoolName: row.school.name,
        schoolCode: formatSchoolCodeForClass(row.school.code, row.school.id),
        boardName: row.school.board.name,
        studentCount: sections.reduce((sum, s) => sum + s.studentCount, 0),
        subjectCount: row._count.subjects,
      }
    })

    return items.sort(compareClassListItems)
  }

  async findSchoolOptions(): Promise<SchoolOption[]> {
    const rows = await prisma.school.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
    return rows
  }

  async createClass(input: ClassInput): Promise<void> {
    await prisma.class.create({
      data: { schoolId: input.schoolId, name: input.name },
    })
  }

  async updateClass(id: string, name: string): Promise<void> {
    await prisma.class.update({ where: { id }, data: { name } })
  }

  async deleteClass(id: string): Promise<void> {
    await prisma.class.delete({ where: { id } })
  }

  async countClassSubjects(id: string): Promise<number> {
    return prisma.subject.count({ where: { classId: id } })
  }

  async createSection(input: SectionInput): Promise<void> {
    await prisma.section.create({
      data: { classId: input.classId, name: input.name },
    })
  }

  async updateSection(id: string, name: string): Promise<void> {
    await prisma.section.update({ where: { id }, data: { name } })
  }

  async deleteSection(id: string): Promise<void> {
    await prisma.section.delete({ where: { id } })
  }

  async countSectionStudents(id: string): Promise<number> {
    return prisma.user.count({ where: { sectionId: id } })
  }
}

export const classRepository = new ClassRepository()
