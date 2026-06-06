import { cache } from "react"

import { requireAdminSession } from "@/lib/auth/session"

import type { ProfilePageData } from "../model/profile"
import { userService } from "../service/user.service"

export const loadProfilePageData = cache(async (): Promise<ProfilePageData> => {
  const session = await requireAdminSession()
  return userService.getProfilePageData(session.sub)
})
