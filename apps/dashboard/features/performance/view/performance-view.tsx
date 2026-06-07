import type { PerformanceDashboardData } from "../repository/performance.repository"
import { PerformanceBentoGrid } from "./performance-bento-grid"

type PerformanceViewProps = {
  dashboard: PerformanceDashboardData
}

export function PerformanceView({ dashboard }: PerformanceViewProps) {
  return <PerformanceBentoGrid dashboard={dashboard} />
}
