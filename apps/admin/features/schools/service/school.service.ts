import type { SchoolListItem } from "../model/school-list-item"
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
}

export const schoolService = new SchoolService()
