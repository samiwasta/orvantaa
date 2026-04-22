import type { UserGender } from "../model/user-gender"

export async function loadDashboardUserGender(): Promise<UserGender> {
  return "female"
}
