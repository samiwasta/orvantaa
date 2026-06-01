import type {
  ChapterInput,
  ContentBoardItem,
  ContentBoardRef,
  ContentChapterItem,
  ContentChapterRef,
  ContentClassItem,
  ContentClassRef,
  ContentSubjectItem,
  ContentSubjectRef,
  ContentNoteItem,
  ContentTopicDetailRef,
  ContentTopicItem,
  NoteInput,
  SubjectInput,
  TopicInput,
} from "../model/content-models"
import type { NoteBlock } from "../model/note-blocks"
import type {
  ContentQuizListItem,
  QuizCreateInput,
  QuizEditorData,
  QuizSaveInput,
} from "../model/quiz-models"
import {
  type ContentRepository,
  contentRepository,
} from "../repository/content.repository"

export class ContentService {
  constructor(
    private readonly repository: ContentRepository = contentRepository
  ) {}

  async listBoards(): Promise<ContentBoardItem[]> {
    return this.repository.findBoards()
  }

  async getBoardRef(boardId: string): Promise<ContentBoardRef | null> {
    return this.repository.findBoardRef(boardId)
  }

  async listClassesForBoard(boardId: string): Promise<ContentClassItem[]> {
    return this.repository.findClassesForBoard(boardId)
  }

  async getClassRef(classId: string): Promise<ContentClassRef | null> {
    return this.repository.findClassRef(classId)
  }

  async classBelongsToBoard(
    classId: string,
    boardId: string
  ): Promise<boolean> {
    return this.repository.classBelongsToBoard(classId, boardId)
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

  async getTopicDetailRef(
    topicId: string
  ): Promise<ContentTopicDetailRef | null> {
    return this.repository.findTopicDetailRef(topicId)
  }

  async listNotesForTopic(topicId: string): Promise<ContentNoteItem[]> {
    return this.repository.findNotesForTopic(topicId)
  }

  async getNote(id: string) {
    return this.repository.findNoteById(id)
  }

  async createNote(topicId: string, input: NoteInput): Promise<string> {
    return this.repository.createNote(topicId, input)
  }

  async saveNote(id: string, title: string, blocks: NoteBlock[]): Promise<void> {
    await this.repository.updateNote(id, title, blocks)
  }

  async deleteNote(id: string): Promise<void> {
    await this.repository.deleteNote(id)
  }

  async listQuizzesForChapter(chapterId: string): Promise<ContentQuizListItem[]> {
    return this.repository.findQuizzesForChapter(chapterId)
  }

  async getQuizForEditor(id: string): Promise<QuizEditorData | null> {
    return this.repository.findQuizForEditor(id)
  }

  async createQuiz(chapterId: string, input: QuizCreateInput): Promise<string> {
    return this.repository.createQuiz(chapterId, input)
  }

  async saveQuiz(id: string, input: QuizSaveInput): Promise<void> {
    await this.repository.saveQuizFull(id, input)
  }

  async deleteQuiz(id: string): Promise<void> {
    await this.repository.deleteQuiz(id)
  }
}

export const contentService = new ContentService()
