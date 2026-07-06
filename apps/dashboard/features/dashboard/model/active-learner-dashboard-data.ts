export type CurrentLessonProgress = {
  subjectTitle: string
  chapterLabel: string
  completedItems: number
  totalItems: number
  progressPercent: number
  isCompleted: boolean
  continueHref: string
}

export type PerformanceSummaryStat = {
  label: string
  value: string
  tone: "purple" | "orange" | "amber" | "teal"
}

export type DashboardActionCard = {
  badge: string
  title: string
  subtitle?: string
  buttonLabel: string
  href: string
  secondaryButtonLabel?: string
  secondaryHref?: string
  imageSrc: string
  imageAlt: string
  variant: "purple" | "white" | "blue"
  progressPercent?: number
  progressLabel?: string
}

export type DashboardPerformanceInsights = {
  strength: {
    label: string
    subject: string
  }
  growthArea: {
    label: string
    subject: string
  }
  tip: string
}

export type ActiveLearnerDashboardData = {
  currentLesson: CurrentLessonProgress
  performance: {
    gradePaceLabel: string
    stats: PerformanceSummaryStat[]
  }
  actionCards: DashboardActionCard[]
  performanceInsights: DashboardPerformanceInsights
}
