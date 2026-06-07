export type WeeklyAccuracyPoint = {
  day: string
  value: number | null
}

export type SubjectAccuracy = {
  subjectId: string
  subject: string
  value: number
  tier: "high" | "medium" | "low"
}

export type FocusChapter = {
  id: string
  label: string
  href: string
}

export type PerformanceInsights = {
  strength: {
    label: string
    subject: string
  }
  needsImprovement: {
    label: string
    subject: string
  }
  tip: string
  focusChapters: FocusChapter[]
}

export const weeklyAccuracyTrend: WeeklyAccuracyPoint[] = [
  { day: "Mon", value: 55 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 68 },
  { day: "Thu", value: 72 },
  { day: "Fri", value: 76 },
  { day: "Sat", value: 79 },
  { day: "Sun", value: 82 },
]

export const weeklyAccuracyDeltaPercent = 12

export const subjectAccuracy: SubjectAccuracy[] = [
  { subjectId: "mock-maths", subject: "Maths", value: 82, tier: "medium" },
  { subjectId: "mock-science", subject: "Science", value: 74, tier: "medium" },
  { subjectId: "mock-english", subject: "English", value: 88, tier: "high" },
  { subjectId: "mock-physics", subject: "Physics", value: 69, tier: "low" },
  {
    subjectId: "mock-chemistry",
    subject: "Chemistry",
    value: 72,
    tier: "medium",
  },
  { subjectId: "mock-biology", subject: "Biology", value: 91, tier: "high" },
]

export const performanceInsights = {
  strength: {
    label: "STRENGTH",
    subject: "Biology",
  },
  needsImprovement: {
    label: "NEEDS IMPROVEMENT",
    subject: "Physics",
  },
  tip: "You're performing well in Biology. Focus more on Physics to improve your overall score.",
  focusChapters: [
    {
      id: "motion-force",
      label: "Ch 2: Motion & Force",
      href: "/subjects/physics",
    },
    {
      id: "laws-of-motion",
      label: "Ch 4: Laws of Motion",
      href: "/subjects/physics",
    },
  ] satisfies FocusChapter[],
}

export const subjectBarColors: Record<SubjectAccuracy["tier"], string> = {
  high: "#22c55e",
  medium: "#eab308",
  low: "#ef4444",
}

// ─── Report card ──────────────────────────────────────────────────────────────
export type ExamKey = "unit1" | "term1" | "unit2" | "final"

export type ExamDef = {
  key: ExamKey
  label: string
  maxMarks: number
}

export type SubjectReportScore = {
  subjectId: string
  subject: string
  scores: Record<ExamKey, number | null>
}

export type ReportCard = {
  id: string | null
  title: string
  exams: ExamDef[]
  subjects: SubjectReportScore[]
}

export const DEFAULT_REPORT_CARD_EXAMS: ExamDef[] = [
  { key: "unit1", label: "1st Unit Test", maxMarks: 25 },
  { key: "term1", label: "1st Term", maxMarks: 100 },
  { key: "unit2", label: "2nd Unit Test", maxMarks: 25 },
  { key: "final", label: "Final Exam", maxMarks: 100 },
]

export const reportCardExams = DEFAULT_REPORT_CARD_EXAMS

export function createEmptyReportCard(
  subjects: Array<{ id: string; title: string }>,
  title = "Report Card"
): ReportCard {
  const exams = DEFAULT_REPORT_CARD_EXAMS.map((exam) => ({ ...exam }))
  const emptyScores = (): Record<ExamKey, number | null> => ({
    unit1: null,
    term1: null,
    unit2: null,
    final: null,
  })

  return {
    id: null,
    title,
    exams,
    subjects: subjects.map((subject) => ({
      subjectId: subject.id,
      subject: subject.title,
      scores: emptyScores(),
    })),
  }
}

export function calcOverallPercent(card: ReportCard): number {
  let totalMax = 0
  let totalObtained = 0

  for (const sub of card.subjects) {
    for (const exam of card.exams) {
      const obtained = sub.scores[exam.key]
      if (obtained === null || obtained === undefined) continue
      totalObtained += obtained
      totalMax += exam.maxMarks
    }
  }

  if (totalMax === 0) return 0
  return Math.round((totalObtained / totalMax) * 100)
}

export function calcSubjectPercent(
  sub: SubjectReportScore,
  exams: ExamDef[]
): number {
  let max = 0
  let obtained = 0

  for (const exam of exams) {
    const score = sub.scores[exam.key]
    if (score === null || score === undefined) continue
    obtained += score
    max += exam.maxMarks
  }

  if (max === 0) return 0
  return Math.round((obtained / max) * 100)
}
