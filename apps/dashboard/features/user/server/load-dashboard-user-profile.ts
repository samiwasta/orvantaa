import { cache } from "react"

import { requireStudentSession } from "@/features/auth/server/get-auth-session"

import type { DashboardUserProfile } from "../model/user"
import { userService } from "../service/user.service"

export const loadDashboardUserProfile = cache(
  async (): Promise<DashboardUserProfile> => {
    const session = await requireStudentSession()
    return userService.getDashboardProfile(session.sub)
  }
)
