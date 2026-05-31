import type {
  BoardOption,
  SchoolInput,
  SchoolListItem,
} from "../model/school-list-item"
import {
  type SchoolRepository,
  schoolRepository,
} from "../repository/school.repository"

export class SchoolService {
  constructor(
    private readonly repository: SchoolRepository = schoolRepository
  ) {}

  async listSchools(): Promise<SchoolListItem[]> {
    return this.repository.findAllSchools()
  }

  async listBoardOptions(): Promise<BoardOption[]> {
    return this.repository.findBoardOptions()
  }

  async createSchool(input: SchoolInput): Promise<void> {
    await this.repository.createSchool(input)
  }

  async updateSchool(id: string, input: SchoolInput): Promise<void> {
    await this.repository.updateSchool(id, input)
  }

  async deleteSchool(id: string): Promise<void> {
    const classCount = await this.repository.countClasses(id)
    if (classCount > 0) {
      throw new Error(
        `Cannot delete a school with ${classCount} class${classCount === 1 ? "" : "es"}. Remove them first.`
      )
    }
    await this.repository.deleteSchool(id)
  }
}

export const schoolService = new SchoolService()
