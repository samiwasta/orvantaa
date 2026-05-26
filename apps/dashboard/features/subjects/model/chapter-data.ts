import { getSubjectBySlug } from "./subject-cards"

export type ChapterStatus = "completed" | "in_progress" | "not_started"

export type ChapterItem = {
  number: number
  title: string
  status: ChapterStatus
  progressPercent: number
  recommended?: boolean
}

const mathematicsChapters: ChapterItem[] = [
  {
    number: 1,
    title: "Numbers",
    status: "completed",
    progressPercent: 100,
  },
  {
    number: 2,
    title: "Introduction to Algebra",
    status: "completed",
    progressPercent: 100,
  },
  {
    number: 3,
    title: "Linear Equations",
    status: "in_progress",
    progressPercent: 16,
    recommended: true,
  },
  {
    number: 4,
    title: "Quadratic Equations",
    status: "not_started",
    progressPercent: 0,
  },
  {
    number: 5,
    title: "Polynomials",
    status: "in_progress",
    progressPercent: 44,
  },
  {
    number: 6,
    title: "Hypothesis Testing",
    status: "completed",
    progressPercent: 100,
  },
  {
    number: 7,
    title: "Rational Expressions",
    status: "not_started",
    progressPercent: 0,
  },
  {
    number: 8,
    title: "Inequalities",
    status: "completed",
    progressPercent: 100,
  },
  {
    number: 9,
    title: "Trigonometry",
    status: "not_started",
    progressPercent: 0,
  },
  {
    number: 10,
    title: "Coordinate Geometry",
    status: "in_progress",
    progressPercent: 72,
  },
  {
    number: 11,
    title: "Statistics Basics",
    status: "not_started",
    progressPercent: 0,
  },
  {
    number: 12,
    title: "Review",
    status: "not_started",
    progressPercent: 0,
  },
]

function chaptersFromProgress(
  total: number,
  completedCount: number
): ChapterItem[] {
  return Array.from({ length: total }, (_, i) => {
    const number = i + 1
    if (i < completedCount) {
      return {
        number,
        title: `Chapter ${number}`,
        status: "completed" as const,
        progressPercent: 100,
      }
    }
    if (i === completedCount) {
      const progressPercent = Math.min(88, 10 + ((number * 13) % 50))
      return {
        number,
        title: `Chapter ${number}`,
        status: "in_progress" as const,
        progressPercent,
        recommended: number === 3,
      }
    }
    return {
      number,
      title: `Chapter ${number}`,
      status: "not_started" as const,
      progressPercent: 0,
    }
  })
}

export function getChaptersForSubject(slug: string): ChapterItem[] | undefined {
  const subject = getSubjectBySlug(slug)
  if (!subject) return undefined
  if (slug === "mathematics") return mathematicsChapters
  return chaptersFromProgress(subject.total, subject.completed)
}

export function chapterSlug(chapter: ChapterItem): string {
  const slug = chapter.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || `chapter-${chapter.number}`
}

export function getChapterBySlug(
  subjectSlug: string,
  chapterSlugParam: string
): ChapterItem | undefined {
  const chapters = getChaptersForSubject(subjectSlug)
  return chapters?.find((ch) => chapterSlug(ch) === chapterSlugParam)
}

const learningObjectivesBySlug: Record<string, string[]> = {
  "linear-equations": [
    "Understanding linear equations",
    "Solving equations step-by-step",
    "Real-life applications",
  ],
}

export function getLearningObjectives(chapter: ChapterItem): string[] {
  const slug = chapterSlug(chapter)
  if (learningObjectivesBySlug[slug]) return learningObjectivesBySlug[slug]
  return [
    `Understanding key concepts in ${chapter.title}`,
    `Practicing ${chapter.title.toLowerCase()} step-by-step`,
    "Applying ideas to real-life situations",
  ]
}

// ── Topics ────────────────────────────────────────────────────────────────────

export type TopicStatus = "completed" | "in_progress" | "not_started"

export type TopicItem = {
  id: string
  title: string
  duration: string
  status: TopicStatus
}

const topicsByChapterSlug: Record<string, TopicItem[]> = {
  "linear-equations": [
    {
      id: "intro",
      title: "Introduction to Linear Equations",
      duration: "5 min",
      status: "completed",
    },
    {
      id: "one-variable",
      title: "Equations with One Variable",
      duration: "8 min",
      status: "completed",
    },
    {
      id: "solving-steps",
      title: "Step-by-Step Solving Method",
      duration: "10 min",
      status: "in_progress",
    },
    {
      id: "word-problems",
      title: "Word Problems",
      duration: "12 min",
      status: "not_started",
    },
    {
      id: "graphs",
      title: "Graphing Linear Equations",
      duration: "10 min",
      status: "not_started",
    },
    {
      id: "real-life",
      title: "Real-Life Applications",
      duration: "8 min",
      status: "not_started",
    },
  ],
}

function defaultTopics(chapter: ChapterItem): TopicItem[] {
  const titles = [
    `Introduction to ${chapter.title}`,
    `Core Concepts`,
    `Worked Examples`,
    `Practice Problems`,
    `Summary & Review`,
  ]
  return titles.map((title, i) => ({
    id: String(i),
    title,
    duration: `${6 + i * 2} min`,
    status:
      i < 2
        ? ("completed" as const)
        : i === 2
          ? ("in_progress" as const)
          : ("not_started" as const),
  }))
}

export function getTopicsForChapter(chapter: ChapterItem): TopicItem[] {
  const slug = chapterSlug(chapter)
  return topicsByChapterSlug[slug] ?? defaultTopics(chapter)
}

// ── Quizzes ───────────────────────────────────────────────────────────────────

export type QuizDifficulty = "easy" | "medium" | "hard"
export type QuizStatus = "completed" | "available" | "locked"

export type QuizItem = {
  id: string
  title: string
  questions: number
  difficulty: QuizDifficulty
  status: QuizStatus
  score?: number
}

const quizzesByChapterSlug: Record<string, QuizItem[]> = {
  "linear-equations": [
    {
      id: "q1",
      title: "Quick Check – Basics",
      questions: 5,
      difficulty: "easy",
      status: "completed",
      score: 80,
    },
    {
      id: "q2",
      title: "Mid-Chapter Quiz",
      questions: 10,
      difficulty: "medium",
      status: "available",
    },
    {
      id: "q3",
      title: "Word Problems Challenge",
      questions: 8,
      difficulty: "medium",
      status: "locked",
    },
    {
      id: "q4",
      title: "Final Chapter Test",
      questions: 15,
      difficulty: "hard",
      status: "locked",
    },
  ],
}

function defaultQuizzes(chapter: ChapterItem): QuizItem[] {
  return [
    {
      id: "q1",
      title: "Quick Check",
      questions: 5,
      difficulty: "easy",
      status: "completed",
      score: 100,
    },
    {
      id: "q2",
      title: `${chapter.title} Quiz`,
      questions: 10,
      difficulty: "medium",
      status: chapter.status !== "not_started" ? "available" : "locked",
    },
    {
      id: "q3",
      title: "Final Test",
      questions: 15,
      difficulty: "hard",
      status: "locked",
    },
  ]
}

export function getQuizzesForChapter(chapter: ChapterItem): QuizItem[] {
  const slug = chapterSlug(chapter)
  return quizzesByChapterSlug[slug] ?? defaultQuizzes(chapter)
}
