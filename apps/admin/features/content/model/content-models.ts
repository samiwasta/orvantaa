import { z } from "zod"

export type ContentBoardItem = {
  id: string
  name: string
  slug: string
  kindLabel: string
  classCount: number
  subjectCount: number
}

export type ContentBoardRef = {
  id: string
  name: string
  slug: string
}

export type ContentClassItem = {
  id: string
  boardId: string
  schoolId: string
  schoolName: string
  name: string
  displayName: string
  sectionCount: number
  subjectCount: number
}

export type ContentSubjectItem = {
  id: string
  classId: string
  title: string
  slug: string
  imageUrl: string | null
  orderIndex: number
  chapterCount: number
}

export type ContentChapterItem = {
  id: string
  subjectId: string
  title: string
  slug: string
  orderIndex: number
  topicCount: number
}

export type ContentSubjectRef = {
  id: string
  title: string
  classId: string
  classDisplayName: string
  boardId: string
  boardName: string
  schoolId: string
  schoolName: string
}

export type ContentTopicItem = {
  id: string
  chapterId: string
  title: string
  slug: string
  orderIndex: number
  noteCount: number
}

export type ContentChapterRef = {
  id: string
  title: string
  number: number
  subjectId: string
  subjectTitle: string
  classId: string
  classDisplayName: string
  boardId: string
  boardName: string
  schoolId: string
  schoolName: string
}

export type ContentClassRef = {
  id: string
  name: string
  displayName: string
  boardId: string
  boardName: string
  schoolId: string
  schoolName: string
  schoolCode: string
}

export function formatClassDisplay(name: string): string {
  const trimmed = name.trim()
  return /^class\s/i.test(trimmed) ? trimmed : `Class ${trimmed}`
}

export function formatSchoolCode(code: string | null, id: string): string {
  const trimmed = code?.trim()
  if (trimmed) return trimmed.toUpperCase()
  return id.slice(0, 8).toUpperCase()
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const subjectInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens"
    ),
  imageUrl: z
    .string()
    .max(500)
    .optional()
    .transform((value) => {
      const trimmed = value?.trim()
      return trimmed ? trimmed : null
    }),
})

export type SubjectInput = z.infer<typeof subjectInputSchema>

export const chapterInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(160, "Title is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(160, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens"
    ),
})

export type ChapterInput = z.infer<typeof chapterInputSchema>

export const topicInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(160, "Title is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(160, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens"
    ),
})

export type TopicInput = z.infer<typeof topicInputSchema>

export type ContentNoteItem = {
  id: string
  topicId: string
  title: string
  orderIndex: number
  blockCount: number
}

export type ContentTopicDetailRef = ContentChapterRef & {
  topicId: string
  topicTitle: string
  topicSlug: string
}

export const noteInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(160, "Title is too long"),
})

export type NoteInput = z.infer<typeof noteInputSchema>

