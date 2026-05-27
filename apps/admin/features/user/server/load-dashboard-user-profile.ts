import { cache } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"

import type { DashboardUserProfile } from "../model/user"
import { userService } from "../service/user.service"

export const loadDashboardUserProfile = cache(
  async (): Promise<DashboardUserProfile> => {
    const session = await getAuthSession()
    if (!session) {
      throw new Error("Unauthorized")
    }
    return userService.getDashboardProfile(session.sub)
  }
)
