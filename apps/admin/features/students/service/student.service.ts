import bcrypt from "bcryptjs"

import type {
  SectionOption,
  StudentCreateInput,
  StudentListItem,
  StudentUpdateInput,
} from "../model/student-list-item"
import {
  type StudentRepository,
  studentRepository,
} from "../repository/student.repository"

export class StudentService {
  constructor(
    private readonly repository: StudentRepository = studentRepository
  ) {}

  async listStudents(): Promise<StudentListItem[]> {
    return this.repository.findAllStudents()
  }

  async listSectionOptions(): Promise<SectionOption[]> {
    return this.repository.findSectionOptions()
  }

  async createStudent(input: StudentCreateInput): Promise<void> {
    const passwordHash = await bcrypt.hash(input.password, 10)
    await this.repository.createStudent({
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName ?? "",
      gender: input.gender,
      sectionId: input.sectionId ?? null,
      passwordHash,
    })
  }

  async updateStudent(id: string, input: StudentUpdateInput): Promise<void> {
    const passwordHash =
      input.password && input.password.length > 0
        ? await bcrypt.hash(input.password, 10)
        : undefined
    await this.repository.updateStudent(id, {
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName ?? "",
      gender: input.gender,
      sectionId: input.sectionId ?? null,
      passwordHash,
    })
  }

  async deleteStudent(id: string): Promise<void> {
    await this.repository.deleteStudent(id)
  }
}

export const studentService = new StudentService()
