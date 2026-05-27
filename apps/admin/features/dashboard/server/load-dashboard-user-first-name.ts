import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

export async function loadDashboardUserFirstName(): Promise<string> {
  const profile = await loadDashboardUserProfile()
  return profile.firstName
}
