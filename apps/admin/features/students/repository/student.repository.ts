import { prisma } from "@/lib/db"

import { formatUserFullName } from "@/features/user/model/user"

import {
  formatStudentDisplayId,
  type SectionOption,
  type StudentListItem,
} from "../model/student-list-item"

type StudentWriteData = {
  username: string
  email: string
  firstName: string
  lastName: string
  gender: "male" | "female"
  sectionId: string | null
  passwordHash?: string
}

export class StudentRepository {
  async findAllStudents(): Promise<StudentListItem[]> {
    const rows = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        gender: true,
        sectionId: true,
        section: {
          select: {
            name: true,
            class: {
              select: {
                name: true,
                school: {
                  select: {
                    name: true,
                    board: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      studentId: formatStudentDisplayId(row.username),
      firstName: row.firstName,
      lastName: row.lastName,
      fullName: formatUserFullName(row.firstName, row.lastName),
      email: row.email,
      username: row.username,
      phoneNumber: null,
      schoolName: row.section?.class.school.name ?? null,
      boardName: row.section?.class.school.board.name ?? null,
      className: row.section?.class.name ?? null,
      section: row.section?.name ?? null,
      sectionId: row.sectionId,
      gender: row.gender === "MALE" ? "male" : "female",
    }))
  }

  async findSectionOptions(): Promise<SectionOption[]> {
    const rows = await prisma.section.findMany({
      orderBy: [{ class: { school: { name: "asc" } } }, { class: { name: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        class: {
          select: {
            name: true,
            school: { select: { name: true } },
          },
        },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      label: `${row.class.school.name} · Class ${row.class.name} - ${row.name}`,
    }))
  }

  async createStudent(data: StudentWriteData): Promise<void> {
    await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash ?? "",
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender === "male" ? "MALE" : "FEMALE",
        role: "STUDENT",
        sectionId: data.sectionId,
      },
    })
  }

  async updateStudent(id: string, data: StudentWriteData): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender === "male" ? "MALE" : "FEMALE",
        sectionId: data.sectionId,
        ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
      },
    })
  }

  async deleteStudent(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}

export const studentRepository = new StudentRepository()
