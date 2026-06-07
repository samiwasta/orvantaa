import type { ActiveLearnerDashboardData } from "../model/active-learner-dashboard-data"
import { ActiveLearnerBentoGrid } from "./active-learner-bento-grid"

export function ActiveLearnerDashboard({
  data,
}: {
  data: ActiveLearnerDashboardData
}) {
  return <ActiveLearnerBentoGrid data={data} />
}
