import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"

import {
  type ChapterInput,
  type ContentChapterItem,
  type ContentChapterRef,
  type ContentClassItem,
  type ContentClassRef,
  type ContentSchoolItem,
  type ContentSchoolRef,
  type ContentSubjectItem,
  type ContentSubjectRef,
  type ContentNoteItem,
  type ContentTopicDetailRef,
  type ContentTopicItem,
  formatClassDisplay,
  formatSchoolCode,
  type NoteInput,
  type SubjectInput,
  type TopicInput,
} from "../model/content-models"
import { type NoteBlock, parseNoteBlocks } from "../model/note-blocks"

export class ContentRepository {
  async findSchools(): Promise<ContentSchoolItem[]> {
    const rows = await prisma.school.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        board: { select: { name: true } },
        _count: { select: { classes: true } },
        classes: { select: { _count: { select: { subjects: true } } } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: formatSchoolCode(row.code, row.id),
      boardName: row.board.name,
      classCount: row._count.classes,
      subjectCount: row.classes.reduce(
        (sum, cls) => sum + cls._count.subjects,
        0
      ),
    }))
  }

  async findSchoolRef(schoolId: string): Promise<ContentSchoolRef | null> {
    const row = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true, code: true },
    })
    if (!row) return null
    return { id: row.id, name: row.name, code: formatSchoolCode(row.code, row.id) }
  }

  async findClassesForSchool(schoolId: string): Promise<ContentClassItem[]> {
    const rows = await prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { sections: true, subjects: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      schoolId,
      name: row.name,
      displayName: formatClassDisplay(row.name),
      sectionCount: row._count.sections,
      subjectCount: row._count.subjects,
    }))
  }

  async findClassRef(classId: string): Promise<ContentClassRef | null> {
    const row = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        school: { select: { id: true, name: true, code: true } },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      displayName: formatClassDisplay(row.name),
      schoolId: row.school.id,
      schoolName: row.school.name,
      schoolCode: formatSchoolCode(row.school.code, row.school.id),
    }
  }

  async findSubjectsForClass(classId: string): Promise<ContentSubjectItem[]> {
    const rows = await prisma.subject.findMany({
      where: { classId },
      orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        orderIndex: true,
        _count: { select: { chapters: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      classId,
      title: row.title,
      slug: row.slug,
      orderIndex: row.orderIndex,
      chapterCount: row._count.chapters,
    }))
  }

  async createSubject(classId: string, input: SubjectInput): Promise<void> {
    const last = await prisma.subject.findFirst({
      where: { classId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    })
    await prisma.subject.create({
      data: {
        classId,
        title: input.title,
        slug: input.slug,
        orderIndex: (last?.orderIndex ?? -1) + 1,
      },
    })
  }

  async updateSubject(id: string, input: SubjectInput): Promise<void> {
    await prisma.subject.update({
      where: { id },
      data: { title: input.title, slug: input.slug },
    })
  }

  async deleteSubject(id: string): Promise<void> {
    await prisma.subject.delete({ where: { id } })
  }

  async countSubjectChapters(id: string): Promise<number> {
    return prisma.chapter.count({ where: { subjectId: id } })
  }

  async findSubjectRef(subjectId: string): Promise<ContentSubjectRef | null> {
    const row = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        title: true,
        class: {
          select: {
            id: true,
            name: true,
            school: { select: { id: true, name: true } },
          },
        },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      title: row.title,
      classId: row.class.id,
      classDisplayName: formatClassDisplay(row.class.name),
      schoolId: row.class.school.id,
      schoolName: row.class.school.name,
    }
  }

  async findChaptersForSubject(
    subjectId: string
  ): Promise<ContentChapterItem[]> {
    const rows = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: [{ number: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        number: true,
        _count: { select: { topics: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      subjectId,
      title: row.title,
      slug: row.slug,
      orderIndex: row.number,
      topicCount: row._count.topics,
    }))
  }

  async createChapter(subjectId: string, input: ChapterInput): Promise<void> {
    const last = await prisma.chapter.findFirst({
      where: { subjectId },
      orderBy: { number: "desc" },
      select: { number: true },
    })
    await prisma.chapter.create({
      data: {
        subjectId,
        title: input.title,
        slug: input.slug,
        number: (last?.number ?? 0) + 1,
      },
    })
  }

  async updateChapter(id: string, input: ChapterInput): Promise<void> {
    await prisma.chapter.update({
      where: { id },
      data: { title: input.title, slug: input.slug },
    })
  }

  async deleteChapter(id: string): Promise<void> {
    await prisma.chapter.delete({ where: { id } })
  }

  async countChapterTopics(id: string): Promise<number> {
    return prisma.topic.count({ where: { chapterId: id } })
  }

  async findChapterRef(chapterId: string): Promise<ContentChapterRef | null> {
    const row = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        title: true,
        number: true,
        subject: {
          select: {
            id: true,
            title: true,
            class: {
              select: {
                id: true,
                name: true,
                school: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      title: row.title,
      number: row.number,
      subjectId: row.subject.id,
      subjectTitle: row.subject.title,
      classId: row.subject.class.id,
      classDisplayName: formatClassDisplay(row.subject.class.name),
      schoolId: row.subject.class.school.id,
      schoolName: row.subject.class.school.name,
    }
  }

  async findTopicsForChapter(chapterId: string): Promise<ContentTopicItem[]> {
    const rows = await prisma.topic.findMany({
      where: { chapterId },
      orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        orderIndex: true,
        _count: { select: { notes: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      chapterId,
      title: row.title,
      slug: row.slug,
      orderIndex: row.orderIndex,
      noteCount: row._count.notes,
    }))
  }

  async createTopic(chapterId: string, input: TopicInput): Promise<void> {
    const last = await prisma.topic.findFirst({
      where: { chapterId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    })
    await prisma.topic.create({
      data: {
        chapterId,
        title: input.title,
        slug: input.slug,
        orderIndex: (last?.orderIndex ?? -1) + 1,
      },
    })
  }

  async updateTopic(id: string, input: TopicInput): Promise<void> {
    await prisma.topic.update({
      where: { id },
      data: { title: input.title, slug: input.slug },
    })
  }

  async deleteTopic(id: string): Promise<void> {
    await prisma.topic.delete({ where: { id } })
  }

  async countTopicNotes(id: string): Promise<number> {
    return prisma.note.count({ where: { topicId: id } })
  }

  async findTopicDetailRef(topicId: string): Promise<ContentTopicDetailRef | null> {
    const row = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        title: true,
        slug: true,
        chapter: {
          select: {
            id: true,
            title: true,
            number: true,
            subject: {
              select: {
                id: true,
                title: true,
                class: {
                  select: {
                    id: true,
                    name: true,
                    school: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!row) return null
    return {
      topicId: row.id,
      topicTitle: row.title,
      topicSlug: row.slug,
      id: row.chapter.id,
      title: row.chapter.title,
      number: row.chapter.number,
      subjectId: row.chapter.subject.id,
      subjectTitle: row.chapter.subject.title,
      classId: row.chapter.subject.class.id,
      classDisplayName: formatClassDisplay(row.chapter.subject.class.name),
      schoolId: row.chapter.subject.class.school.id,
      schoolName: row.chapter.subject.class.school.name,
    }
  }

  async findNotesForTopic(topicId: string): Promise<ContentNoteItem[]> {
    const rows = await prisma.note.findMany({
      where: { topicId },
      orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
      select: {
        id: true,
        topicId: true,
        title: true,
        orderIndex: true,
        blocks: true,
      },
    })

    return rows.map((row) => ({
      id: row.id,
      topicId: row.topicId,
      title: row.title,
      orderIndex: row.orderIndex,
      blockCount: Array.isArray(row.blocks) ? row.blocks.length : 0,
    }))
  }

  async findNoteById(id: string): Promise<{
    id: string
    topicId: string
    title: string
    orderIndex: number
    blocks: NoteBlock[]
  } | null> {
    const row = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        topicId: true,
        title: true,
        orderIndex: true,
        blocks: true,
      },
    })
    if (!row) return null
    return {
      id: row.id,
      topicId: row.topicId,
      title: row.title,
      orderIndex: row.orderIndex,
      blocks: parseNoteBlocks(row.blocks),
    }
  }

  async createNote(topicId: string, input: NoteInput): Promise<string> {
    const last = await prisma.note.findFirst({
      where: { topicId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    })
    const row = await prisma.note.create({
      data: {
        topicId,
        title: input.title,
        orderIndex: (last?.orderIndex ?? -1) + 1,
        blocks: [],
      },
      select: { id: true },
    })
    return row.id
  }

  async updateNote(
    id: string,
    title: string,
    blocks: NoteBlock[]
  ): Promise<void> {
    await prisma.note.update({
      where: { id },
      data: { title, blocks: blocks as Prisma.InputJsonValue },
    })
  }

  async updateNoteTitle(id: string, input: NoteInput): Promise<void> {
    await prisma.note.update({
      where: { id },
      data: { title: input.title },
    })
  }

  async deleteNote(id: string): Promise<void> {
    await prisma.note.delete({ where: { id } })
  }
}

export const contentRepository = new ContentRepository()
