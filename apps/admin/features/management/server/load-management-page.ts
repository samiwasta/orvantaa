import { cache } from "react"

import { loadIntegrationStatus, loadPlatformSettings } from "@/features/settings/server/load-platform-settings"
import { loadTeamMembers } from "@/features/team/server/load-team-members"
import { requireAdminSession } from "@/lib/auth/session"
import { isSuperAdminUsername } from "@/lib/auth/super-admin"

export type ManagementTabId = "team" | "subscription-settings"

export const loadManagementPage = cache(async () => {
  const [members, session, settings, integrationStatus] = await Promise.all([
    loadTeamMembers(),
    requireAdminSession(),
    loadPlatformSettings(),
    loadIntegrationStatus(),
  ])

  return {
    members,
    currentAdminId: session.sub,
    currentUserIsSuperAdmin: isSuperAdminUsername(session.username),
    settings,
    integrationStatus,
  }
})
