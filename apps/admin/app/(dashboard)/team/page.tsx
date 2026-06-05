import type { Metadata } from "next"

import { requireAdminSession } from "@/lib/auth/session"

import { loadTeamMembers } from "@/features/team/server/load-team-members"
import { TeamView } from "@/features/team/view/team-view"

export const metadata: Metadata = {
  title: "Team - Orvantaa Admin",
  description: "Admin team members",
}

export default async function TeamPage() {
  const [members, session] = await Promise.all([
    loadTeamMembers(),
    requireAdminSession(),
  ])
  return <TeamView members={members} currentAdminId={session.sub} />
}
