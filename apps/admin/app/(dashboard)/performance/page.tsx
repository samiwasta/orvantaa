import type { Metadata } from "next"

import { PerformanceView } from "@/features/performance/view/performance-view"

export const metadata: Metadata = {
  title: "Performance - Orvantaa",
  description: "Track your learning progress and subject-wise accuracy",
}

export default function PerformancePage() {
  return <PerformanceView />
}
