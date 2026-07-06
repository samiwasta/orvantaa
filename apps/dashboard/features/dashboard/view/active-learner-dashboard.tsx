import type { ActiveLearnerDashboardData } from "../model/active-learner-dashboard-data"
import { ActiveLearnerBentoGrid } from "./active-learner-bento-grid"

export function ActiveLearnerDashboard({
  data,
  userFirstName,
}: {
  data: ActiveLearnerDashboardData
  userFirstName?: string
}) {
  return <ActiveLearnerBentoGrid data={data} userFirstName={userFirstName} />
}
