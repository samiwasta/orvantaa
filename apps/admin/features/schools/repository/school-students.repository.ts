import { type Prisma, UserRole } from "@prisma/client"

import { formatClassDisplayName, parseClassLevel } from "@/features/classes/model/class-list-item"
import { mapPrismaGenderToUserGender, mapUserGenderToPrismaGender } from "@/features/user/model/user"
import { prisma } from "@/lib/db"

import {
  formatMailStatusLabel,
  formatStudentDisplayCode,
  formatStudentFullName,
  mapClassTab,
  compareClassTabs,
  mapPrismaMailStatus,
  type SchoolClassTab,
  type SchoolSectionOption,
  type SchoolStudentInput,
  type SchoolStudentListItem,
  type SchoolSyllabusClassRow,
} from "../model/school-student-list-item"
import {
  formatOrvntStudentCode,
  maxOrvntStudentCodeSequence,
} from "../model/school-student-code"

function mapStudentRow(row: {
  id: string
  username: string
  email: string
  phone: string | null
  studentCode: string | null
  firstName: string
  lastName: string
  gender: "MALE" | "FEMALE"
  mailStatus: "NOT_SENT" | "SENT"
  section: {
    id: string
    name: string
    class: { id: string; name: string }
  } | null
}): SchoolStudentListItem {
  const classDisplayName = row.section
    ? formatClassDisplayName(row.section.class.name)
    : null

  return {
    id: row.id,
    studentCode: formatStudentDisplayCode(row.studentCode, row.username, row.id),
    fullName: formatStudentFullName(row.firstName, row.lastName),
    firstName: row.firstName,
    lastName: row.lastName,
    classId: row.section?.class.id ?? null,
    classDisplayName,
    sectionId: row.section?.id ?? null,
    sectionName: row.section?.name ?? null,
    email: row.email,
    phone: row.phone,
    gender: mapPrismaGenderToUserGender(row.gender),
    username: row.username,
    mailStatus: mapPrismaMailStatus(row.mailStatus),
    mailStatusLabel: formatMailStatusLabel(mapPrismaMailStatus(row.mailStatus)),
  }
}

export class SchoolStudentsRepository {
  async findStudentsBySchoolId(schoolId: string): Promise<SchoolStudentListItem[]> {
    const rows = await prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        section: { class: { schoolId } },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        studentCode: true,
        firstName: true,
        lastName: true,
        gender: true,
        mailStatus: true,
        section: {
          select: {
            id: true,
            name: true,
            class: { select: { id: true, name: true } },
          },
        },
      },
    })

    return rows.map(mapStudentRow)
  }

  async findClassTabs(schoolId: string): Promise<SchoolClassTab[]> {
    const rows = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, name: true },
    })

    return rows.map((row) => mapClassTab(row.name, row.id)).sort(compareClassTabs)
  }

  async findSectionOptions(schoolId: string): Promise<SchoolSectionOption[]> {
    const rows = await prisma.section.findMany({
      where: { class: { schoolId } },
      select: {
        id: true,
        name: true,
        class: { select: { id: true, name: true } },
      },
    })

    const sortedRows = [...rows].sort((a, b) => {
      const levelA = parseClassLevel(a.class.name)
      const levelB = parseClassLevel(b.class.name)
      if (levelA !== levelB) return levelA - levelB
      const classNameOrder = a.class.name.localeCompare(b.class.name, undefined, {
        numeric: true,
      })
      if (classNameOrder !== 0) return classNameOrder
      return a.name.localeCompare(b.name, undefined, { numeric: true })
    })

    return sortedRows.map((row) => ({
      id: row.id,
      name: row.name,
      classId: row.class.id,
      classDisplayName: formatClassDisplayName(row.class.name),
    }))
  }

  async findSyllabusRows(schoolId: string): Promise<SchoolSyllabusClassRow[]> {
    const rows = await prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { subjects: true } },
      },
    })

    return rows.map((row) => ({
      classId: row.id,
      classDisplayName: formatClassDisplayName(row.name),
      subjectCount: row._count.subjects,
    }))
  }

  async sectionBelongsToSchool(sectionId: string, schoolId: string): Promise<boolean> {
    const count = await prisma.section.count({
      where: { id: sectionId, class: { schoolId } },
    })
    return count > 0
  }

  async getMaxOrvntStudentCodeSequence(): Promise<number> {
    const rows = await prisma.$queryRaw<Array<{ max: bigint | number | null }>>`
      SELECT MAX(CAST(SUBSTRING(UPPER("studentCode") FROM 6) AS INTEGER)) AS max
      FROM users
      WHERE UPPER("studentCode") ~ '^ORVNT[0-9]+$'
    `

    const value = rows[0]?.max
    if (value === null || value === undefined) return 0
    return typeof value === "bigint" ? Number(value) : value
  }

  async allocateStudentCode(
    reserved: ReadonlySet<string> = new Set()
  ): Promise<string> {
    const dbMax = await this.getMaxOrvntStudentCodeSequence()
    let next = Math.max(dbMax, maxOrvntStudentCodeSequence(reserved)) + 1

    while (true) {
      const candidate = formatOrvntStudentCode(next)
      if (reserved.has(candidate)) {
        next += 1
        continue
      }

      const existing = await prisma.user.findFirst({
        where: {
          studentCode: { equals: candidate, mode: "insensitive" },
        },
        select: { id: true },
      })
      if (!existing) return candidate

      next += 1
    }
  }

  async findUniqueUsername(
    base: string,
    reserved: ReadonlySet<string> = new Set()
  ): Promise<string> {
    const normalized = base.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "")
    const root = normalized || "student"
    let candidate = root
    let suffix = 1

    while (true) {
      if (!reserved.has(candidate)) {
        const existing = await prisma.user.findUnique({
          where: { username: candidate },
          select: { id: true },
        })
        if (!existing) return candidate
      }
      candidate = `${root}${suffix}`
      suffix += 1
    }
  }

  async createStudent(
    schoolId: string,
    input: SchoolStudentInput,
    passwordHash: string,
    username: string
  ): Promise<void> {
    await prisma.user.create({
      data: {
        username,
        email: input.email.trim().toLowerCase(),
        passwordHash,
        studentCode: input.studentCode ?? null,
        phone: input.phone ?? null,
        firstName: input.firstName.trim(),
        lastName: input.lastName?.trim() ?? "",
        gender: mapUserGenderToPrismaGender(input.gender),
        role: UserRole.STUDENT,
        sectionId: input.sectionId,
        mailStatus: "NOT_SENT",
      },
    })
    void schoolId
  }

  async createStudentsBulk(
    entries: Array<{
      input: SchoolStudentInput
      passwordHash: string
      username: string
    }>
  ): Promise<void> {
    await prisma.$transaction(
      entries.map((entry) =>
        prisma.user.create({
          data: {
            username: entry.username,
            email: entry.input.email.trim().toLowerCase(),
            passwordHash: entry.passwordHash,
            studentCode: entry.input.studentCode ?? null,
            phone: entry.input.phone ?? null,
            firstName: entry.input.firstName.trim(),
            lastName: entry.input.lastName?.trim() ?? "",
            gender: mapUserGenderToPrismaGender(entry.input.gender),
            role: UserRole.STUDENT,
            sectionId: entry.input.sectionId,
            mailStatus: "NOT_SENT",
          },
        })
      )
    )
  }

  async updateStudent(
    id: string,
    input: SchoolStudentInput,
    passwordHash?: string
  ): Promise<void> {
    const data: Prisma.UserUpdateInput = {
      email: input.email.trim().toLowerCase(),
      phone: input.phone ?? null,
      firstName: input.firstName.trim(),
      lastName: input.lastName?.trim() ?? "",
      gender: mapUserGenderToPrismaGender(input.gender),
      section: { connect: { id: input.sectionId } },
    }

    if (input.studentCode !== undefined) {
      data.studentCode = input.studentCode
    }

    if (passwordHash) {
      data.passwordHash = passwordHash
    }

    await prisma.user.update({ where: { id }, data })
  }

  async deleteStudent(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }

  async studentBelongsToSchool(studentId: string, schoolId: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        id: studentId,
        role: UserRole.STUDENT,
        section: { class: { schoolId } },
      },
    })
    return count > 0
  }

  async findStudentsPendingCredentialEmail(
    schoolId: string,
    classId?: string
  ): Promise<
    Array<{
      id: string
      email: string
      firstName: string
      username: string
      studentCode: string | null
    }>
  > {
    return prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        mailStatus: "NOT_SENT",
        section: {
          class: {
            schoolId,
            ...(classId ? { id: classId } : {}),
          },
        },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        email: true,
        firstName: true,
        username: true,
        studentCode: true,
      },
    })
  }

  async updateStudentAfterCredentialsSent(
    studentId: string,
    passwordHash: string
  ): Promise<void> {
    await prisma.user.update({
      where: { id: studentId },
      data: {
        passwordHash,
        mailStatus: "SENT",
        mustChangePassword: true,
      },
    })
  }
}

export const schoolStudentsRepository = new SchoolStudentsRepository()
