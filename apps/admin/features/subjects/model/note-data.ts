import type { ChapterItem } from "./chapter-data"
import {
  chapterSlug,
  getChapterBySlug,
  getTopicsForChapter,
} from "./chapter-data"

export type NoteBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "definition"; title: string; content: string }
  | {
      type: "example"
      title: string
      steps: string[]
      tip?: string
    }
  | { type: "list"; items: string[] }

export type NoteContent = {
  id: string
  topicId: string
  chapterSlug: string
  title: string
  lessonNumber: number
  totalLessons: number
  blocks: NoteBlock[]
}

export type NoteSummary = {
  id: string
  title: string
}

const notesByTopicKey: Record<string, NoteContent[]> = {
  "linear-equations:intro": [
    {
      id: "1",
      topicId: "intro",
      chapterSlug: "linear-equations",
      title: "What is a Linear Equation?",
      lessonNumber: 1,
      totalLessons: 2,
      blocks: [
        {
          type: "paragraph",
          text: "A linear equation is an equation where the highest power of the variable is 1. These equations form straight lines when graphed and are among the most fundamental tools in algebra.",
        },
        {
          type: "definition",
          title: "Definition",
          content:
            "A linear equation in one variable has the form ax + b = 0, where a and b are constants and a is not equal to 0.",
        },
        {
          type: "example",
          title: "Example",
          steps: [
            "Solve: 2x + 6 = 0",
            "Subtract 6 from both sides: 2x = -6",
            "Divide both sides by 2: x = -3",
          ],
          tip: "Always perform the same operation on both sides to keep the equation balanced.",
        },
        {
          type: "paragraph",
          text: "When you plot solutions on a number line or coordinate plane, every solution to a linear equation in one variable is a single point. In two variables, the solutions form a straight line.",
        },
      ],
    },
    {
      id: "2",
      topicId: "intro",
      chapterSlug: "linear-equations",
      title: "Standard Form of Linear Equations",
      lessonNumber: 2,
      totalLessons: 2,
      blocks: [
        {
          type: "paragraph",
          text: "Linear equations can be written in several equivalent forms. Recognising each form helps you solve problems faster and interpret graphs more easily.",
        },
        {
          type: "definition",
          title: "Standard Form",
          content:
            "The standard form of a linear equation in two variables is Ax + By = C, where A, B, and C are integers and A is non-negative.",
        },
        {
          type: "list",
          items: [
            "Slope-intercept form: y = mx + c",
            "Point-slope form: y - y₁ = m(x - x₁)",
            "Standard form: Ax + By = C",
          ],
        },
        {
          type: "example",
          title: "Example",
          steps: [
            "Write 2y = 4x + 8 in standard form.",
            "Subtract 4x from both sides: -4x + 2y = 8",
            "Multiply by -1 if needed: 4x - 2y = -8",
          ],
        },
      ],
    },
  ],
  "linear-equations:one-variable": [
    {
      id: "1",
      topicId: "one-variable",
      chapterSlug: "linear-equations",
      title: "Solving Equations with One Variable",
      lessonNumber: 1,
      totalLessons: 1,
      blocks: [
        {
          type: "paragraph",
          text: "To solve a linear equation with one variable, isolate the variable using inverse operations. Work step by step and check your answer by substitution.",
        },
        {
          type: "definition",
          title: "Inverse Operations",
          content:
            "Addition undoes subtraction, subtraction undoes addition, multiplication undoes division, and division undoes multiplication.",
        },
        {
          type: "example",
          title: "Example",
          steps: [
            "Solve: 3x - 7 = 11",
            "Add 7 to both sides: 3x = 18",
            "Divide by 3: x = 6",
            "Check: 3(6) - 7 = 11",
          ],
          tip: "Substitute your answer back into the original equation to verify.",
        },
      ],
    },
  ],
  "linear-equations:solving-steps": [
    {
      id: "1",
      topicId: "solving-steps",
      chapterSlug: "linear-equations",
      title: "Step-by-Step Solving Method",
      lessonNumber: 1,
      totalLessons: 1,
      blocks: [
        {
          type: "paragraph",
          text: "A reliable solving method reduces mistakes. Follow the same sequence every time: simplify, move variable terms to one side, move constants to the other, then divide.",
        },
        {
          type: "list",
          items: [
            "Simplify both sides (distribute, combine like terms)",
            "Collect variable terms on one side",
            "Collect constant terms on the other side",
            "Divide or multiply to isolate the variable",
            "Check the solution",
          ],
        },
        {
          type: "example",
          title: "Example",
          steps: [
            "Solve: 4(x - 2) = 2x + 4",
            "Expand: 4x - 8 = 2x + 4",
            "Subtract 2x: 2x - 8 = 4",
            "Add 8: 2x = 12",
            "Divide by 2: x = 6",
          ],
        },
      ],
    },
  ],
}

function topicKey(chapterSlug: string, topicId: string) {
  return `${chapterSlug}:${topicId}`
}

function defaultNote(
  chapter: ChapterItem,
  topicId: string,
  topicTitle: string,
  noteId: string,
  lessonNumber: number,
  totalLessons: number
): NoteContent {
  return {
    id: noteId,
    topicId,
    chapterSlug: chapterSlug(chapter),
    title: topicTitle,
    lessonNumber,
    totalLessons,
    blocks: [
      {
        type: "paragraph",
        text: `This lesson introduces the key ideas behind ${topicTitle.toLowerCase()}. Read through each section carefully before moving to practice.`,
      },
      {
        type: "definition",
        title: "Key Idea",
        content: `${topicTitle} is an important part of ${chapter.title}. Understanding the definitions and worked examples will help you solve exam-style questions.`,
      },
      {
        type: "example",
        title: "Worked Example",
        steps: [
          "Read the problem and identify what is unknown.",
          "Write an equation that models the situation.",
          "Solve using inverse operations.",
          "State the answer with appropriate units.",
        ],
        tip: "Sketch a quick diagram when the problem describes a real-world situation.",
      },
    ],
  }
}

export function getNoteSummariesForTopic(
  chapterSlugParam: string,
  topicId: string
): NoteSummary[] {
  const notes = notesByTopicKey[topicKey(chapterSlugParam, topicId)]
  if (notes) return notes.map((n) => ({ id: n.id, title: n.title }))
  return [{ id: "1", title: "Introduction" }]
}

export function getNote(
  chapterSlugParam: string,
  topicId: string,
  noteId: string,
  chapter?: ChapterItem
): NoteContent | undefined {
  const key = topicKey(chapterSlugParam, topicId)
  const notes = notesByTopicKey[key]
  if (notes) {
    return notes.find((n) => n.id === noteId)
  }

  if (!chapter) return undefined
  const topics = getTopicsForChapter(chapter)
  const topic = topics.find((t) => t.id === topicId)
  if (!topic || noteId !== "1") return undefined

  return defaultNote(chapter, topicId, topic.title, "1", 1, 1)
}

export function getTopicById(chapter: ChapterItem, topicId: string) {
  return getTopicsForChapter(chapter).find((t) => t.id === topicId)
}

export function resolveNotePage(
  subjectSlug: string,
  chapterSlugParam: string,
  topicId: string,
  noteId: string
):
  | {
      chapter: ChapterItem
      topic: NonNullable<ReturnType<typeof getTopicById>>
      note: NoteContent
    }
  | undefined {
  const chapter = getChapterBySlug(subjectSlug, chapterSlugParam)
  if (!chapter) return undefined

  const topic = getTopicById(chapter, topicId)
  if (!topic) return undefined

  const note =
    getNote(chapterSlugParam, topicId, noteId, chapter) ??
    getNote(chapterSlugParam, topicId, "1", chapter)
  if (!note) return undefined

  return { chapter, topic, note }
}

export function getNoteNavigation(
  chapterSlugParam: string,
  topicId: string,
  noteId: string
) {
  const summaries = getNoteSummariesForTopic(chapterSlugParam, topicId)
  const index = summaries.findIndex((s) => s.id === noteId)
  const prevItem = index > 0 ? summaries[index - 1] : undefined
  const nextItem =
    index >= 0 && index < summaries.length - 1
      ? summaries[index + 1]
      : undefined

  return {
    prev: prevItem ? { id: prevItem.id, title: prevItem.title } : undefined,
    next: nextItem ? { id: nextItem.id, title: nextItem.title } : undefined,
  }
}

export function noteHref(
  subjectSlug: string,
  chapterSlugParam: string,
  topicId: string,
  noteId: string
) {
  return `/subjects/${subjectSlug}/${chapterSlugParam}/${topicId}/${noteId}`
}

export function topicFirstNoteHref(
  subjectSlug: string,
  chapterSlugParam: string,
  topicId: string
) {
  const summaries = getNoteSummariesForTopic(chapterSlugParam, topicId)
  return noteHref(
    subjectSlug,
    chapterSlugParam,
    topicId,
    summaries[0]?.id ?? "1"
  )
}
