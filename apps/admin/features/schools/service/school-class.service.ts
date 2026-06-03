import type { BoardClassOption } from "../model/board-class-option"
import { createSchoolClassesSchema } from "../model/board-class-option"
import {
  type SchoolClassRepository,
  schoolClassRepository,
} from "../repository/school-class.repository"

export class SchoolClassService {
  constructor(
    private readonly repository: SchoolClassRepository = schoolClassRepository
  ) {}

  async listBoardClassOptions(
    boardId: string,
    schoolId: string
  ): Promise<BoardClassOption[]> {
    return this.repository.findBoardClassOptions(boardId, schoolId)
  }

  async createClassesFromBoardOptions(
    schoolId: string,
    boardId: string,
    raw: unknown
  ): Promise<number> {
    const parsed = createSchoolClassesSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid selection")
    }

    const allowed = await this.repository.findBoardClassOptions(boardId, schoolId)
    const allowedByKey = new Map(
      allowed.map((option) => [option.name.toLowerCase(), option.name])
    )

    const names: string[] = []
    for (const name of parsed.data.names) {
      const canonical = allowedByKey.get(name.trim().toLowerCase())
      if (!canonical) {
        throw new Error(`"${name}" is not available for this board.`)
      }
      names.push(canonical)
    }

    await this.repository.createClasses(schoolId, names)
    return names.length
  }
}

export const schoolClassService = new SchoolClassService()
