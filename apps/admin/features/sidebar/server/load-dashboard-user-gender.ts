import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

import type { UserGender } from "../model/user-gender"

export async function loadDashboardUserGender(): Promise<UserGender> {
  const profile = await loadDashboardUserProfile()
  return profile.gender
}
