import bcrypt from "bcryptjs"

import {
  formatOrvntStudentCode,
  maxOrvntStudentCodeSequence,
} from "../model/school-student-code"
import {
  type CsvStudentRow,
  csvStudentRowSchema,
  generateRandomPassword,
  parseStudentsCsv,
} from "../model/school-student-csv"
import { studentCredentialsEmailService } from "./student-credentials-email.service"
import {
  type SchoolSectionOption,
  schoolStudentCreateSchema,
  type SchoolStudentInput,
  schoolStudentInputSchema,
} from "../model/school-student-list-item"
import { schoolStudentsRepository } from "../repository/school-students.repository"
import { schoolRecurringSubscriptionService } from "./school-recurring-subscription.service"

function normalizeClassKey(value: string): string {
  return value.trim().toLowerCase().replace(/^class\s+/i, "")
}

function resolveSectionId(
  sections: SchoolSectionOption[],
  className: string,
  sectionName: string
): string | null {
  const classKey = normalizeClassKey(className)
  const sectionKey = sectionName.trim().toLowerCase()

  const match = sections.find((section) => {
    const sectionClassKey = normalizeClassKey(section.classDisplayName)
    return (
      (sectionClassKey === classKey ||
        section.classDisplayName.trim().toLowerCase() ===
          className.trim().toLowerCase()) &&
      section.name.trim().toLowerCase() === sectionKey
    )
  })

  return match?.id ?? null
}

export class SchoolStudentsService {
  private readonly repository = schoolStudentsRepository

  private async afterStudentCountMayHaveChanged(schoolId: string): Promise<void> {
    try {
      await schoolRecurringSubscriptionService.syncSubscriptionQuantityForSchool(
        schoolId
      )
    } catch (error) {
      console.error(
        `[subscription] Quantity sync failed for school ${schoolId}:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getSectionOptions(schoolId: string) {
    return this.repository.findSectionOptions(schoolId)
  }

  async createStudent(schoolId: string, raw: unknown): Promise<void> {
    const parsed = schoolStudentCreateSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid student data")
    }

    const input = parsed.data
    const belongs = await this.repository.sectionBelongsToSchool(
      input.sectionId,
      schoolId
    )
    if (!belongs) {
      throw new Error("Selected section does not belong to this school.")
    }

    const studentCode = await this.repository.allocateStudentCode()
    const usernameBase =
      input.email.split("@")[0]?.toLowerCase() ?? studentCode.toLowerCase()
    const username = await this.repository.findUniqueUsername(usernameBase)
    const plainPassword = generateRandomPassword()
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    await this.repository.createStudent(
      schoolId,
      { ...input, studentCode },
      passwordHash,
      username
    )
    await this.afterStudentCountMayHaveChanged(schoolId)
  }

  async updateStudent(
    schoolId: string,
    studentId: string,
    raw: unknown
  ): Promise<void> {
    const parsed = schoolStudentInputSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid student data")
    }

    const input = parsed.data
    const studentOk = await this.repository.studentBelongsToSchool(
      studentId,
      schoolId
    )
    if (!studentOk) {
      throw new Error("Student not found for this school.")
    }

    const sectionOk = await this.repository.sectionBelongsToSchool(
      input.sectionId,
      schoolId
    )
    if (!sectionOk) {
      throw new Error("Selected section does not belong to this school.")
    }

    let passwordHash: string | undefined
    if (input.password && input.password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(input.password.trim(), 10)
    }

    await this.repository.updateStudent(studentId, input, passwordHash)
  }

  async deleteStudent(schoolId: string, studentId: string): Promise<void> {
    const studentOk = await this.repository.studentBelongsToSchool(
      studentId,
      schoolId
    )
    if (!studentOk) {
      throw new Error("Student not found for this school.")
    }
    await this.repository.deleteStudent(studentId)
    await this.afterStudentCountMayHaveChanged(schoolId)
  }

  async importStudentsFromCsv(
    schoolId: string,
    csvText: string,
    sections: SchoolSectionOption[]
  ): Promise<{ imported: number }> {
    const parsedCsv = parseStudentsCsv(csvText)
    if (parsedCsv.error) {
      throw new Error(parsedCsv.error)
    }

    const validatedRows: CsvStudentRow[] = []
    const errors: string[] = []

    parsedCsv.rows.forEach((row, index) => {
      const result = csvStudentRowSchema.safeParse({
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        className: row.className,
        sectionName: row.sectionName,
      })

      if (!result.success) {
        const message = result.error.issues[0]?.message ?? "Invalid row"
        errors.push(`Row ${index + 2}: ${message}`)
        return
      }

      validatedRows.push(result.data)
    })

    if (errors.length > 0) {
      throw new Error(errors.slice(0, 5).join("\n"))
    }

    const entries: Array<{
      input: SchoolStudentInput
      passwordHash: string
      username: string
    }> = []
    const reservedUsernames = new Set<string>()
    const reservedStudentCodes = new Set<string>()
    let nextStudentSequence =
      (await this.repository.getMaxOrvntStudentCodeSequence()) + 1

    for (let i = 0; i < validatedRows.length; i += 1) {
      const row = validatedRows[i]!
      const sectionId = resolveSectionId(sections, row.className, row.sectionName)
      if (!sectionId) {
        throw new Error(
          `Row ${i + 2}: Could not find class "${row.className}" with section "${row.sectionName}" in this school.`
        )
      }

      const belongs = await this.repository.sectionBelongsToSchool(sectionId, schoolId)
      if (!belongs) {
        throw new Error(`Row ${i + 2}: Section does not belong to this school.`)
      }

      nextStudentSequence = Math.max(
        nextStudentSequence,
        maxOrvntStudentCodeSequence(reservedStudentCodes) + 1
      )

      let studentCode = formatOrvntStudentCode(nextStudentSequence)
      while (reservedStudentCodes.has(studentCode)) {
        nextStudentSequence += 1
        studentCode = formatOrvntStudentCode(nextStudentSequence)
      }
      reservedStudentCodes.add(studentCode)
      nextStudentSequence += 1

      const usernameBase = row.email.split("@")[0]?.toLowerCase() ?? "student"
      const username = await this.repository.findUniqueUsername(
        usernameBase,
        reservedUsernames
      )
      reservedUsernames.add(username)

      const plainPassword = generateRandomPassword()
      const passwordHash = await bcrypt.hash(plainPassword, 10)

      entries.push({
        input: {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          studentCode,
          sectionId,
          gender: "female",
        },
        passwordHash,
        username,
      })
    }

    await this.repository.createStudentsBulk(entries)
    await this.afterStudentCountMayHaveChanged(schoolId)
    return { imported: entries.length }
  }

  async sendCredentialsToPendingStudents(
    schoolId: string,
    classId?: string
  ): Promise<{ sent: number; failed: number }> {
    const pending = await this.repository.findStudentsPendingCredentialEmail(
      schoolId,
      classId
    )

    if (pending.length === 0) {
      return { sent: 0, failed: 0 }
    }

    let sent = 0
    let failed = 0

    for (const student of pending) {
      const plainPassword = generateRandomPassword()
      const passwordHash = await bcrypt.hash(plainPassword, 10)

      try {
        await studentCredentialsEmailService.sendCredentials({
          to: student.email,
          firstName: student.firstName.trim() || "there",
          username: student.username,
          plainPassword,
          studentCode: student.studentCode,
          userId: student.id,
        })
        await this.repository.updateStudentAfterCredentialsSent(
          student.id,
          passwordHash
        )
        sent += 1
      } catch {
        failed += 1
      }
    }

    return { sent, failed }
  }
}

export const schoolStudentsService = new SchoolStudentsService()
