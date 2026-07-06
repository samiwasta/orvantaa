import type { Metadata } from "next"

import {
  parseDashboardPreviewMode,
  resolveShowActiveLearnerDashboard,
} from "@/features/dashboard/model/dashboard-view-mode"
import { loadActiveLearnerDashboard } from "@/features/dashboard/server/load-active-learner-dashboard"
import { loadDashboardPageData } from "@/features/dashboard/server/load-dashboard-page-data"
import { ActiveLearnerDashboard } from "@/features/dashboard/view/active-learner-dashboard"
import { NewLearnerDashboard } from "@/features/dashboard/view/dashboard-bento-grid"

export const metadata: Metadata = {
  title: "Dashboard - Orvantaa",
  description: "Welcome to your Orvantaa dashboard",
}

type DashboardPageProps = {
  searchParams: Promise<{ dashboard?: string }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams
  const previewMode = parseDashboardPreviewMode(params.dashboard)

  const { firstName, userGender, quickLinks, hasLearningActivity } =
    await loadDashboardPageData()

  const { showActiveLearner } = resolveShowActiveLearnerDashboard(
    hasLearningActivity,
    previewMode
  )

  const activeLearnerData = showActiveLearner
    ? await loadActiveLearnerDashboard()
    : null

  return (
    <>
      {showActiveLearner && activeLearnerData ? (
        <ActiveLearnerDashboard
          data={activeLearnerData}
          userFirstName={firstName}
        />
      ) : (
        <NewLearnerDashboard
          userGender={userGender}
          quickLinks={quickLinks}
          userFirstName={firstName}
        />
      )}
    </>
  )
}
