import { prisma } from "@/lib/db"

import {
  type ClassInput,
  type ClassListItem,
  type ClassSectionItem,
  compareCatalogClassItems,
  compareClassListItems,
  formatClassDisplayName,
  formatSchoolCodeForClass,
  parseClassLevel,
  type SchoolOption,
  type SectionInput,
} from "../model/class-list-item"

function mapClassRows(
  rows: Array<{
    id: string
    name: string
    school: {
      id: string
      name: string
      code: string | null
      board: { name: string }
    }
    sections: Array<{
      id: string
      name: string
      _count: { students: number }
    }>
    _count: { subjects: number }
  }>
): ClassListItem[] {
  return rows.map((row) => {
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
      studentCount: sections.reduce((sum, section) => sum + section.studentCount, 0),
      subjectCount: row._count.subjects,
    }
  })
}

export class ClassRepository {
  async findClassesBySchoolId(schoolId: string): Promise<ClassListItem[]> {
    const rows = await prisma.class.findMany({
      where: { schoolId },
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

    return mapClassRows(rows).sort((a, b) => {
      const levelA = parseClassLevel(a.className)
      const levelB = parseClassLevel(b.className)
      if (levelA !== levelB) return levelA - levelB
      return a.className.localeCompare(b.className, undefined, { numeric: true })
    })
  }

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

    return mapClassRows(rows).sort(compareClassListItems)
  }

  async findSchoolOptions(): Promise<SchoolOption[]> {
    const rows = await prisma.school.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
    return rows
  }

  async findCatalogClasses(): Promise<ClassListItem[]> {
    const [platformClasses, schoolClassRows] = await Promise.all([
      prisma.platformClass.findMany({ orderBy: { name: "asc" } }),
      prisma.class.findMany({
        select: {
          name: true,
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
      }),
    ])

    const statsByName = new Map<
      string,
      {
        studentCount: number
        subjectCount: number
        sections: ClassSectionItem[]
      }
    >()

    for (const row of schoolClassRows) {
      const key = row.name.trim().toLowerCase()
      const sections = row.sections.map((section) => ({
        id: section.id,
        name: section.name,
        studentCount: section._count.students,
      }))
      const rowStudentCount = sections.reduce(
        (sum, section) => sum + section.studentCount,
        0
      )
      const existing = statsByName.get(key)
      if (!existing) {
        statsByName.set(key, {
          studentCount: rowStudentCount,
          subjectCount: row._count.subjects,
          sections,
        })
        continue
      }

      existing.studentCount += rowStudentCount
      existing.subjectCount += row._count.subjects
      existing.sections.push(...sections)
    }

    return platformClasses
      .map((platformClass) => {
        const stat = statsByName.get(platformClass.name.trim().toLowerCase())
        return {
          id: platformClass.id,
          schoolId: "",
          className: platformClass.name,
          classDisplayName: formatClassDisplayName(platformClass.name),
          sections: stat?.sections ?? [],
          schoolName: "",
          schoolCode: "",
          boardName: "",
          studentCount: stat?.studentCount ?? 0,
          subjectCount: stat?.subjectCount ?? 0,
        }
      })
      .sort(compareCatalogClassItems)
  }

  async createClass(input: ClassInput): Promise<void> {
    await prisma.class.create({
      data: { schoolId: input.schoolId, name: input.name },
    })
  }

  async createCatalogClass(name: string): Promise<void> {
    const trimmed = name.trim()
    const existing = await prisma.platformClass.findFirst({
      where: { name: { equals: trimmed, mode: "insensitive" } },
    })

    if (existing) {
      throw new Error("This class already exists.")
    }

    await prisma.platformClass.create({ data: { name: trimmed } })
  }

  async renameCatalogClass(currentName: string, name: string): Promise<void> {
    const trimmedCurrent = currentName.trim()
    const trimmedNext = name.trim()

    const platformClass = await prisma.platformClass.findFirst({
      where: { name: { equals: trimmedCurrent, mode: "insensitive" } },
    })

    if (!platformClass) {
      throw new Error("Class not found.")
    }

    const platformConflict = await prisma.platformClass.findFirst({
      where: {
        name: { equals: trimmedNext, mode: "insensitive" },
        NOT: { id: platformClass.id },
      },
      select: { id: true },
    })
    if (platformConflict) {
      throw new Error("This class already exists.")
    }

    const rows = await prisma.class.findMany({
      where: { name: { equals: trimmedCurrent, mode: "insensitive" } },
      select: { id: true, schoolId: true },
    })

    for (const row of rows) {
      const conflict = await prisma.class.findFirst({
        where: {
          schoolId: row.schoolId,
          name: { equals: trimmedNext, mode: "insensitive" },
          NOT: { id: row.id },
        },
        select: { id: true },
      })
      if (conflict) {
        throw new Error("A school already has a class with that name.")
      }
    }

    await prisma.platformClass.update({
      where: { id: platformClass.id },
      data: { name: trimmedNext },
    })

    if (rows.length > 0) {
      await prisma.class.updateMany({
        where: { id: { in: rows.map((row) => row.id) } },
        data: { name: trimmedNext },
      })
    }
  }

  async deleteCatalogClass(name: string): Promise<void> {
    const trimmed = name.trim()
    const platformClass = await prisma.platformClass.findFirst({
      where: { name: { equals: trimmed, mode: "insensitive" } },
    })

    if (!platformClass) {
      throw new Error("Class not found.")
    }

    const rows = await prisma.class.findMany({
      where: { name: { equals: trimmed, mode: "insensitive" } },
      select: {
        id: true,
        _count: { select: { subjects: true } },
        sections: {
          select: { _count: { select: { students: true } } },
        },
      },
    })

    for (const row of rows) {
      if (row._count.subjects > 0) {
        throw new Error(
          "Cannot delete a class that has subjects. Remove its content first."
        )
      }

      const studentCount = row.sections.reduce(
        (sum, section) => sum + section._count.students,
        0
      )
      if (studentCount > 0) {
        throw new Error(
          "Cannot delete a class that has students. Reassign them first."
        )
      }
    }

    if (rows.length > 0) {
      await prisma.class.deleteMany({
        where: { id: { in: rows.map((row) => row.id) } },
      })
    }

    await prisma.platformClass.delete({
      where: { id: platformClass.id },
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
