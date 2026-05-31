import type { ClassListItem } from "../model/class-list-item"
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
}

export const classService = new ClassService()
