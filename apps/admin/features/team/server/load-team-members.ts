import { cache } from "react"

import { requireAdminSession } from "@/lib/auth/session"

import type { TeamMember } from "../model/team-member"
import { teamService } from "../service/team.service"

export const loadTeamMembers = cache(async (): Promise<TeamMember[]> => {
  await requireAdminSession()
  return teamService.listMembers()
})
