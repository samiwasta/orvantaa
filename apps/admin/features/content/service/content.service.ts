import type {
  ChapterInput,
  ContentChapterItem,
  ContentChapterRef,
  ContentClassItem,
  ContentClassRef,
  ContentSchoolItem,
  ContentSchoolRef,
  ContentSubjectItem,
  ContentSubjectRef,
  ContentTopicItem,
  SubjectInput,
  TopicInput,
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

  async getSubjectRef(subjectId: string): Promise<ContentSubjectRef | null> {
    return this.repository.findSubjectRef(subjectId)
  }

  async listChaptersForSubject(
    subjectId: string
  ): Promise<ContentChapterItem[]> {
    return this.repository.findChaptersForSubject(subjectId)
  }

  async createChapter(subjectId: string, input: ChapterInput): Promise<void> {
    await this.repository.createChapter(subjectId, input)
  }

  async updateChapter(id: string, input: ChapterInput): Promise<void> {
    await this.repository.updateChapter(id, input)
  }

  async deleteChapter(id: string): Promise<void> {
    const topicCount = await this.repository.countChapterTopics(id)
    if (topicCount > 0) {
      throw new Error(
        `Cannot delete a chapter with ${topicCount} topic${topicCount === 1 ? "" : "s"}. Remove them first.`
      )
    }
    await this.repository.deleteChapter(id)
  }

  async getChapterRef(chapterId: string): Promise<ContentChapterRef | null> {
    return this.repository.findChapterRef(chapterId)
  }

  async listTopicsForChapter(chapterId: string): Promise<ContentTopicItem[]> {
    return this.repository.findTopicsForChapter(chapterId)
  }

  async createTopic(chapterId: string, input: TopicInput): Promise<void> {
    await this.repository.createTopic(chapterId, input)
  }

  async updateTopic(id: string, input: TopicInput): Promise<void> {
    await this.repository.updateTopic(id, input)
  }

  async deleteTopic(id: string): Promise<void> {
    const noteCount = await this.repository.countTopicNotes(id)
    if (noteCount > 0) {
      throw new Error(
        `Cannot delete a topic with ${noteCount} note${noteCount === 1 ? "" : "s"}. Remove them first.`
      )
    }
    await this.repository.deleteTopic(id)
  }
}

export const contentService = new ContentService()
