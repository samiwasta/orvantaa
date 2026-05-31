import { prisma } from "@/lib/db"

import {
  formatStudentDisplayId,
  type StudentListItem,
} from "../model/student-list-item"
import { formatUserFullName } from "@/features/user/model/user"

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
      phoneNumber: null,
      schoolName: row.section?.class.school.name ?? null,
      boardName: row.section?.class.school.board.name ?? null,
      className: row.section?.class.name ?? null,
      section: row.section?.name ?? null,
    }))
  }
}

export const studentRepository = new StudentRepository()
