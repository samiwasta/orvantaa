export type WeeklyAccuracyPoint = {
  day: string
  value: number
}

export type SubjectAccuracy = {
  subject: string
  value: number
  tier: "high" | "medium" | "low"
}

export type FocusChapter = {
  id: string
  label: string
  href: string
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
  { subject: "Maths", value: 82, tier: "medium" },
  { subject: "Science", value: 74, tier: "medium" },
  { subject: "English", value: 88, tier: "high" },
  { subject: "Physics", value: 69, tier: "low" },
  { subject: "Chemistry", value: 72, tier: "medium" },
  { subject: "Biology", value: 91, tier: "high" },
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
  subject: string
  scores: Record<ExamKey, number | null>
}

export type ReportCard = {
  id: string
  title: string
  exams: ExamDef[]
  subjects: SubjectReportScore[]
}

export const reportCardExams: ExamDef[] = [
  { key: "unit1", label: "1st Unit Test", maxMarks: 25 },
  { key: "term1", label: "1st Term", maxMarks: 100 },
  { key: "unit2", label: "2nd Unit Test", maxMarks: 25 },
  { key: "final", label: "Final Exam", maxMarks: 100 },
]

export const mockReportCard: ReportCard = {
  id: "rc-2024-25",
  title: "Class 10 — 2024-25",
  exams: reportCardExams,
  subjects: [
    {
      subject: "Maths",
      scores: { unit1: 21, term1: 78, unit2: 22, final: 84 },
    },
    {
      subject: "Science",
      scores: { unit1: 18, term1: 72, unit2: 20, final: 76 },
    },
    {
      subject: "English",
      scores: { unit1: 23, term1: 85, unit2: 24, final: 89 },
    },
    {
      subject: "Physics",
      scores: { unit1: 16, term1: 64, unit2: 18, final: 69 },
    },
    {
      subject: "Chemistry",
      scores: { unit1: 19, term1: 70, unit2: 20, final: 74 },
    },
    {
      subject: "Biology",
      scores: { unit1: 22, term1: 88, unit2: 23, final: 91 },
    },
  ],
}

export function calcOverallPercent(card: ReportCard): number {
  const totalMax =
    card.exams.reduce((s, e) => s + e.maxMarks, 0) * card.subjects.length
  const totalObtained = card.subjects.reduce(
    (s, sub) =>
      s + card.exams.reduce((es, e) => es + (sub.scores[e.key] ?? 0), 0),
    0
  )
  return Math.round((totalObtained / totalMax) * 100)
}

export function calcSubjectPercent(
  sub: SubjectReportScore,
  exams: ExamDef[]
): number {
  const max = exams.reduce((s, e) => s + e.maxMarks, 0)
  const obtained = exams.reduce((s, e) => s + (sub.scores[e.key] ?? 0), 0)
  return Math.round((obtained / max) * 100)
}
