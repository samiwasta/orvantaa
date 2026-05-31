import type { StudentListItem } from "../model/student-list-item"
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
}

export const studentService = new StudentService()
