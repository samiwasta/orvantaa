export type DashboardPreviewMode = "auto" | "new" | "active"

export function parseDashboardPreviewMode(
  value: string | undefined
): DashboardPreviewMode {
  if (value === "active" || value === "new") return value
  return "auto"
}

export function resolveShowActiveLearnerDashboard(
  hasLearningActivity: boolean,
  previewMode: DashboardPreviewMode
): {
  showActiveLearner: boolean
  isDevOverride: boolean
  previewMode: DashboardPreviewMode
} {
  if (process.env.NODE_ENV !== "development") {
    return {
      showActiveLearner: hasLearningActivity,
      isDevOverride: false,
      previewMode: "auto",
    }
  }

  if (previewMode === "active") {
    return {
      showActiveLearner: true,
      isDevOverride: true,
      previewMode: "active",
    }
  }

  if (previewMode === "new") {
    return {
      showActiveLearner: false,
      isDevOverride: true,
      previewMode: "new",
    }
  }

  if (process.env.DASHBOARD_FORCE_ACTIVE_LEARNER === "true") {
    return {
      showActiveLearner: true,
      isDevOverride: true,
      previewMode: "auto",
    }
  }

  return {
    showActiveLearner: hasLearningActivity,
    isDevOverride: false,
    previewMode: "auto",
  }
}
