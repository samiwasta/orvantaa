import type {
  ContentClassItem,
  ContentClassRef,
  ContentSchoolItem,
  ContentSchoolRef,
  ContentSubjectItem,
  SubjectInput,
} from "../model/content-models"
import {
  type ContentRepository,
  contentRepository,
} from "../repository/content.repository"

export class ContentService {
  constructor(
    private readonly repository: ContentRepository = contentRepository
  ) {}

  async listSchools(): Promise<ContentSchoolItem[]> {
    return this.repository.findSchools()
  }

  async getSchoolRef(schoolId: string): Promise<ContentSchoolRef | null> {
    return this.repository.findSchoolRef(schoolId)
  }

  async listClassesForSchool(schoolId: string): Promise<ContentClassItem[]> {
    return this.repository.findClassesForSchool(schoolId)
  }

  async getClassRef(classId: string): Promise<ContentClassRef | null> {
    return this.repository.findClassRef(classId)
  }

  async listSubjectsForClass(classId: string): Promise<ContentSubjectItem[]> {
    return this.repository.findSubjectsForClass(classId)
  }

  async createSubject(classId: string, input: SubjectInput): Promise<void> {
    await this.repository.createSubject(classId, input)
  }

  async updateSubject(id: string, input: SubjectInput): Promise<void> {
    await this.repository.updateSubject(id, input)
  }

  async deleteSubject(id: string): Promise<void> {
    const chapterCount = await this.repository.countSubjectChapters(id)
    if (chapterCount > 0) {
      throw new Error(
        `Cannot delete a subject with ${chapterCount} chapter${chapterCount === 1 ? "" : "s"}. Remove them first.`
      )
    }
    await this.repository.deleteSubject(id)
  }
}

export const contentService = new ContentService()
