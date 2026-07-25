import type { Metadata } from "next"

import { loadPerformanceDashboardForCurrentStudent } from "@/features/performance/server/load-performance-dashboard"
import { PerformanceView } from "@/features/performance/view/performance-view"

export const metadata: Metadata = {
  title: "Performance - Orvantaa",
  description:
    "Track your performance score from accuracy, attendance, streak, syllabus, and Orvantaa AI",
}

export default async function PerformancePage() {
  const dashboard = await loadPerformanceDashboardForCurrentStudent()

  return <PerformanceView dashboard={dashboard} />
}
