import type {
  DailyPerformancePoint,
  PerformanceScorecard,
} from "./performance-score"

export type WeeklyAccuracyPoint = {
  day: string
  value: number | null
}

export type { DailyPerformancePoint, PerformanceScorecard }

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
      label: "Motion & Force",
      href: "/subjects/physics",
    },
    {
      id: "laws-of-motion",
      label: "Laws of Motion",
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
  /** Default max marks used when a subject has no custom max yet */
  maxMarks: number
}

export type SubjectReportScore = {
  subjectId: string
  subject: string
  scores: Record<ExamKey, number | null>
  maxMarks: Record<ExamKey, number>
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

export function emptyExamScores(): Record<ExamKey, number | null> {
  return { unit1: null, term1: null, unit2: null, final: null }
}

export function emptyExamMaxMarks(
  exams: ExamDef[] = DEFAULT_REPORT_CARD_EXAMS
): Record<ExamKey, number> {
  return {
    unit1: exams.find((exam) => exam.key === "unit1")?.maxMarks ?? 25,
    term1: exams.find((exam) => exam.key === "term1")?.maxMarks ?? 100,
    unit2: exams.find((exam) => exam.key === "unit2")?.maxMarks ?? 25,
    final: exams.find((exam) => exam.key === "final")?.maxMarks ?? 100,
  }
}

export function createEmptyReportCard(
  subjects: Array<{ id: string; title: string }>,
  title = "Report Card"
): ReportCard {
  const exams = DEFAULT_REPORT_CARD_EXAMS.map((exam) => ({ ...exam }))
  const maxMarks = emptyExamMaxMarks(exams)

  return {
    id: null,
    title,
    exams,
    subjects: subjects.map((subject) => ({
      subjectId: subject.id,
      subject: subject.title,
      scores: emptyExamScores(),
      maxMarks: { ...maxMarks },
    })),
  }
}

export function resolveSubjectExamMax(
  subject: SubjectReportScore,
  exam: ExamDef
): number {
  const custom = subject.maxMarks[exam.key]
  if (typeof custom === "number" && custom > 0) return custom
  return exam.maxMarks
}

export function calcExamPercent(
  obtained: number | null | undefined,
  maxMarks: number
): number | null {
  if (obtained === null || obtained === undefined || maxMarks <= 0) return null
  return Math.round((obtained / maxMarks) * 100)
}

export function calcOverallPercent(card: ReportCard): number {
  let totalMax = 0
  let totalObtained = 0

  for (const sub of card.subjects) {
    for (const exam of card.exams) {
      const obtained = sub.scores[exam.key]
      if (obtained === null || obtained === undefined) continue
      totalObtained += obtained
      totalMax += resolveSubjectExamMax(sub, exam)
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
    max += resolveSubjectExamMax(sub, exam)
  }

  if (max === 0) return 0
  return Math.round((obtained / max) * 100)
}

export function calcExamColumnSummary(
  subjects: SubjectReportScore[],
  exam: ExamDef
): {
  obtained: number
  max: number
  avgPercent: number | null
  hasScores: boolean
} {
  let obtained = 0
  let max = 0
  let scoredSubjects = 0

  for (const subject of subjects) {
    const score = subject.scores[exam.key]
    if (score === null || score === undefined) continue
    obtained += score
    max += resolveSubjectExamMax(subject, exam)
    scoredSubjects += 1
  }

  return {
    obtained,
    max,
    avgPercent: max > 0 ? Math.round((obtained / max) * 100) : null,
    hasScores: scoredSubjects > 0,
  }
}

export function calcAverageOverallPercent(
  subjects: SubjectReportScore[],
  exams: ExamDef[]
): number | null {
  const percents = subjects
    .map((subject) => calcSubjectPercent(subject, exams))
    .filter((percent) => percent > 0)

  if (percents.length === 0) return null

  return Math.round(
    percents.reduce((sum, percent) => sum + percent, 0) / percents.length
  )
}
