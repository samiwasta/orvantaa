export type CurrentLessonProgress = {
  subjectTitle: string
  chapterLabel: string
  completedLessons: number
  totalLessons: number
  progressPercent: number
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
  buttonLabel: string
  href: string
  imageSrc: string
  imageAlt: string
  variant: "purple" | "white" | "blue"
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
