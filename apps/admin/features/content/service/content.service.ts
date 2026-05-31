import type { ContentClassSummary } from "../model/content-class-item"
import type { ContentClassSubjectsResult } from "../model/content-subject-list-item"
import { aggregateContentClassesByGrade } from "../model/content-class-item"
import {
  type ContentRepository,
  contentRepository,
} from "../repository/content.repository"

export class ContentService {
  constructor(
    private readonly repository: ContentRepository = contentRepository
  ) {}

  async listContentClassesByGrade(): Promise<ContentClassSummary[]> {
    const instances = await this.repository.findClassesForContent()
    return aggregateContentClassesByGrade(instances)
  }

  async listSubjectsForClassGrade(
    classNameParam: string
  ): Promise<ContentClassSubjectsResult | null> {
    return this.repository.findSubjectsForClassGrade(classNameParam)
  }
}

export const contentService = new ContentService()
