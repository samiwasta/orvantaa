import { prisma } from "@/lib/db"

import {
  type BoardOption,
  formatBoardKindLabel,
  formatSchoolDisplayCode,
  formatSubscriptionLabel,
  deriveSchoolSyllabusStatus,
  formatSyllabusLabel,
  mapPrismaBoardKind,
  mapPrismaSubscriptionStatus,
  mapSubscriptionStatusToPrisma,
  parseSchoolRouteCode,
  type SchoolCreateInput,
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
        subscriptionStatus: true,
        board: {
          select: {
            name: true,
            kind: true,
          },
        },
        classes: {
          select: {
            _count: { select: { subjects: true } },
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
      const syllabusStatus = deriveSchoolSyllabusStatus(
        row.classes.map((cls) => ({ subjectCount: cls._count.subjects }))
      )
      const subscriptionStatus = mapPrismaSubscriptionStatus(row.subscriptionStatus)

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
        syllabusStatus,
        syllabusLabel: formatSyllabusLabel(syllabusStatus),
        subscriptionStatus,
        subscriptionLabel: formatSubscriptionLabel(subscriptionStatus),
      }
    })
  }

  async findSchoolByRouteCode(routeCode: string): Promise<SchoolListItem | null> {
    const normalized = parseSchoolRouteCode(routeCode)
    if (!normalized) return null

    const byCode = await prisma.school.findFirst({
      where: { code: { equals: normalized, mode: "insensitive" } },
      select: { id: true },
    })

    if (byCode) {
      const schools = await this.findAllSchools()
      return schools.find((s) => s.id === byCode.id) ?? null
    }

    const schools = await this.findAllSchools()
    const upper = normalized.toUpperCase()
    return schools.find((s) => s.schoolCode === upper) ?? null
  }

  async updateSubscriptionStatus(
    id: string,
    subscriptionStatus: SchoolInput["subscriptionStatus"]
  ): Promise<void> {
    await prisma.school.update({
      where: { id },
      data: {
        subscriptionStatus: mapSubscriptionStatusToPrisma(subscriptionStatus),
      },
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

  async createSchool(input: SchoolCreateInput): Promise<string> {
    return prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: input.name,
          code: input.code ?? null,
          boardId: input.boardId,
          subscriptionStatus: mapSubscriptionStatusToPrisma(input.subscriptionStatus),
          billingEmail: input.billingEmail ?? null,
        },
      })

      await tx.schoolContact.create({
        data: {
          schoolId: school.id,
          fullName: input.contact.fullName.trim(),
          designation: input.contact.designation.trim(),
          email: input.contact.email.trim().toLowerCase(),
          phone: input.contact.phone ?? null,
        },
      })

      return school.id
    })
  }

  async updateSchool(id: string, input: SchoolInput): Promise<void> {
    await prisma.school.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code ?? null,
        boardId: input.boardId,
        subscriptionStatus: mapSubscriptionStatusToPrisma(input.subscriptionStatus),
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
