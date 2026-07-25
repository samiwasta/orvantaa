export type PerformanceFactorKey =
  | "accuracy"
  | "attendance"
  | "streak"
  | "syllabus"
  | "learningDepth"
  | "aiEngagement"

export type PerformanceFactor = {
  key: PerformanceFactorKey
  label: string
  description: string
  value: number | null
  weight: number
  detail: string
}

export type PerformanceMetricStat = {
  key: string
  label: string
  value: string
  hint?: string
}

export type PerformanceScorecard = {
  overallScore: number | null
  gradePaceLabel: string
  factors: PerformanceFactor[]
  stats: PerformanceMetricStat[]
  integrityPenalty: number
}

export type DailyPerformancePoint = {
  day: string
  dateKey: string
  value: number | null
  quiz: number | null
  notes: number | null
  ai: number | null
}

/** Weights for the durable overall performance score (sum = 1). */
export const OVERALL_PERFORMANCE_WEIGHTS: Record<PerformanceFactorKey, number> =
  {
    accuracy: 0.3,
    attendance: 0.15,
    streak: 0.1,
    syllabus: 0.2,
    learningDepth: 0.15,
    aiEngagement: 0.1,
  }

/** Weights for a single activity day's composite trend point. */
export const DAILY_PERFORMANCE_WEIGHTS = {
  quiz: 0.55,
  notes: 0.25,
  aiTutor: 0.2,
} as const

export const PERFORMANCE_FACTOR_META: Record<
  PerformanceFactorKey,
  { label: string; description: string }
> = {
  accuracy: {
    label: "Accuracy",
    description: "Average quiz score across attempts",
  },
  attendance: {
    label: "Study attendance",
    description: "Active learning days in the last 28 days",
  },
  streak: {
    label: "Streak",
    description: "Consecutive days with learning activity",
  },
  syllabus: {
    label: "Syllabus",
    description: "Share of assigned chapters completed",
  },
  learningDepth: {
    label: "Learning depth",
    description: "Notes finished and quiz completion quality",
  },
  aiEngagement: {
    label: "Orvantaa AI",
    description: "How often you learn with the AI tutor",
  },
}

export function clampScore(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function roundScore(value: number) {
  return Math.round(clampScore(value))
}

export function computeWeightedScore(
  signals: Array<{ value: number; weight: number }>
) {
  if (signals.length === 0) return null

  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0)
  if (totalWeight <= 0) return null

  const weightedSum = signals.reduce(
    (sum, signal) => sum + signal.value * signal.weight,
    0
  )

  return roundScore(weightedSum / totalWeight)
}

export function gradePaceLabel(score: number | null): string {
  if (score === null) return "Start Strong"
  if (score >= 90) return "A+ Grade Pace"
  if (score >= 80) return "A Grade Pace"
  if (score >= 70) return "B Grade Pace"
  if (score >= 60) return "C Grade Pace"
  return "Keep Practicing"
}

export function scoreStudyAttendance(activeDays: number, windowDays: number) {
  if (windowDays <= 0) return null
  return roundScore((activeDays / windowDays) * 100)
}

export function scoreStudyStreak(streakDays: number, targetDays = 7) {
  if (streakDays <= 0) return 0
  return roundScore((streakDays / targetDays) * 100)
}

export function scoreAiEngagement(userMessagesLast28Days: number) {
  if (userMessagesLast28Days <= 0) return 0
  // 20 prompts in 28 days = full credit
  return roundScore((userMessagesLast28Days / 20) * 100)
}

export function scoreLearningDepth(input: {
  notesCompletedLast28Days: number
  quizzesTakenLast28Days: number
  answerCompletionRate: number | null
}) {
  const notesScore = clampScore((input.notesCompletedLast28Days / 10) * 100)
  const quizVolumeScore = clampScore((input.quizzesTakenLast28Days / 8) * 100)
  const completionScore =
    input.answerCompletionRate === null ? null : input.answerCompletionRate

  const signals: Array<{ value: number; weight: number }> = [
    { value: notesScore, weight: 0.4 },
    { value: quizVolumeScore, weight: 0.35 },
  ]

  if (completionScore !== null) {
    signals.push({ value: completionScore, weight: 0.25 })
  }

  return computeWeightedScore(signals) ?? 0
}

export function scoreIntegrityPenalty(input: {
  averageWarnings: number
  terminatedAttempts: number
  totalAttempts: number
}) {
  if (input.totalAttempts <= 0) return 0

  const warningPenalty = Math.min(12, input.averageWarnings * 2.5)
  const terminationPenalty = Math.min(
    15,
    (input.terminatedAttempts / input.totalAttempts) * 40
  )

  return roundScore(warningPenalty + terminationPenalty)
}

export function buildPerformanceScorecard(input: {
  accuracy: number | null
  attendance: number | null
  streakScore: number
  syllabus: number | null
  learningDepth: number
  aiEngagement: number
  integrityPenalty: number
  stats: PerformanceMetricStat[]
}): PerformanceScorecard {
  const factors: PerformanceFactor[] = (
    Object.keys(OVERALL_PERFORMANCE_WEIGHTS) as PerformanceFactorKey[]
  ).map((key) => {
    const meta = PERFORMANCE_FACTOR_META[key]
    const rawValue = {
      accuracy: input.accuracy,
      attendance: input.attendance,
      streak: input.streakScore,
      syllabus: input.syllabus,
      learningDepth: input.learningDepth,
      aiEngagement: input.aiEngagement,
    }[key]

    return {
      key,
      label: meta.label,
      description: meta.description,
      value: rawValue,
      weight: OVERALL_PERFORMANCE_WEIGHTS[key],
      detail:
        rawValue === null
          ? "Not enough data yet"
          : `${rawValue}% · weight ${Math.round(OVERALL_PERFORMANCE_WEIGHTS[key] * 100)}%`,
    }
  })

  const signals = factors
    .filter(
      (factor): factor is PerformanceFactor & { value: number } =>
        factor.value !== null
    )
    .map((factor) => ({ value: factor.value, weight: factor.weight }))

  let overallScore = computeWeightedScore(signals)

  if (overallScore !== null && input.integrityPenalty > 0) {
    overallScore = roundScore(overallScore - input.integrityPenalty)
  }

  return {
    overallScore,
    gradePaceLabel: gradePaceLabel(overallScore),
    factors,
    stats: input.stats,
    integrityPenalty: input.integrityPenalty,
  }
}

export function formatTimeSpent(totalSeconds: number) {
  if (totalSeconds <= 0) return "0m"

  if (totalSeconds < 60) return `${totalSeconds}s`

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  return `${minutes}m`
}

export function formatStreakDays(streak: number) {
  if (streak <= 0) return "0 days"
  return streak === 1 ? "1 day" : `${streak} days`
}
