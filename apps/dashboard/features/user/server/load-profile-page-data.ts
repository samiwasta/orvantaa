import { cache } from "react"

import { requireStudentSession } from "@/lib/auth/session"

import type { ProfilePageData } from "../model/profile"
import { userService } from "../service/user.service"

export const loadProfilePageData = cache(async (): Promise<ProfilePageData> => {
  const session = await requireStudentSession()
  return userService.getProfilePageData(session.sub)
})
