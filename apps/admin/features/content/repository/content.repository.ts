import { prisma } from "@/lib/db"

import {
  type ContentClassItem,
  type ContentClassRef,
  type ContentSchoolItem,
  type ContentSchoolRef,
  type ContentSubjectItem,
  formatClassDisplay,
  formatSchoolCode,
  type SubjectInput,
} from "../model/content-models"

export class ContentRepository {
  async findSchools(): Promise<ContentSchoolItem[]> {
    const rows = await prisma.school.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        board: { select: { name: true } },
        _count: { select: { classes: true } },
        classes: { select: { _count: { select: { subjects: true } } } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: formatSchoolCode(row.code, row.id),
      boardName: row.board.name,
      classCount: row._count.classes,
      subjectCount: row.classes.reduce(
        (sum, cls) => sum + cls._count.subjects,
        0
      ),
    }))
  }

  async findSchoolRef(schoolId: string): Promise<ContentSchoolRef | null> {
    const row = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true, code: true },
    })
    if (!row) return null
    return { id: row.id, name: row.name, code: formatSchoolCode(row.code, row.id) }
  }

  async findClassesForSchool(schoolId: string): Promise<ContentClassItem[]> {
    const rows = await prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { sections: true, subjects: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      schoolId,
      name: row.name,
      displayName: formatClassDisplay(row.name),
      sectionCount: row._count.sections,
      subjectCount: row._count.subjects,
    }))
  }

  async findClassRef(classId: string): Promise<ContentClassRef | null> {
    const row = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        school: { select: { id: true, name: true, code: true } },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      displayName: formatClassDisplay(row.name),
      schoolId: row.school.id,
      schoolName: row.school.name,
      schoolCode: formatSchoolCode(row.school.code, row.school.id),
    }
  }

  async findSubjectsForClass(classId: string): Promise<ContentSubjectItem[]> {
    const rows = await prisma.subject.findMany({
      where: { classId },
      orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        orderIndex: true,
        _count: { select: { chapters: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      classId,
      title: row.title,
      slug: row.slug,
      orderIndex: row.orderIndex,
      chapterCount: row._count.chapters,
    }))
  }

  async createSubject(classId: string, input: SubjectInput): Promise<void> {
    const last = await prisma.subject.findFirst({
      where: { classId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    })
    await prisma.subject.create({
      data: {
        classId,
        title: input.title,
        slug: input.slug,
        orderIndex: (last?.orderIndex ?? -1) + 1,
      },
    })
  }

  async updateSubject(id: string, input: SubjectInput): Promise<void> {
    await prisma.subject.update({
      where: { id },
      data: { title: input.title, slug: input.slug },
    })
  }

  async deleteSubject(id: string): Promise<void> {
    await prisma.subject.delete({ where: { id } })
  }

  async countSubjectChapters(id: string): Promise<number> {
    return prisma.chapter.count({ where: { subjectId: id } })
  }
}

export const contentRepository = new ContentRepository()
