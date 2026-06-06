import type {
  ClassInput,
  ClassListItem,
  SchoolOption,
  SectionInput,
} from "../model/class-list-item"
import {
  type ClassRepository,
  classRepository,
} from "../repository/class.repository"

export class ClassService {
  constructor(
    private readonly repository: ClassRepository = classRepository
  ) {}

  async listClasses(): Promise<ClassListItem[]> {
    return this.repository.findAllClasses()
  }

  async listClassesBySchoolId(schoolId: string): Promise<ClassListItem[]> {
    return this.repository.findClassesBySchoolId(schoolId)
  }

  async listSchoolOptions(): Promise<SchoolOption[]> {
    return this.repository.findSchoolOptions()
  }

  async createClass(input: ClassInput): Promise<void> {
    await this.repository.createClass(input)
  }

  async updateClass(id: string, name: string): Promise<void> {
    await this.repository.updateClass(id, name)
  }

  async deleteClass(id: string): Promise<void> {
    const subjectCount = await this.repository.countClassSubjects(id)
    if (subjectCount > 0) {
      throw new Error(
        `Cannot delete a class with ${subjectCount} subject${subjectCount === 1 ? "" : "s"}. Remove its content first.`
      )
    }
    await this.repository.deleteClass(id)
  }

  async createSection(input: SectionInput): Promise<void> {
    await this.repository.createSection(input)
  }

  async updateSection(id: string, name: string): Promise<void> {
    await this.repository.updateSection(id, name)
  }

  async deleteSection(id: string): Promise<void> {
    const studentCount = await this.repository.countSectionStudents(id)
    if (studentCount > 0) {
      throw new Error(
        `Cannot delete a section with ${studentCount} student${studentCount === 1 ? "" : "s"}. Reassign them first.`
      )
    }
    await this.repository.deleteSection(id)
  }
}

export const classService = new ClassService()
