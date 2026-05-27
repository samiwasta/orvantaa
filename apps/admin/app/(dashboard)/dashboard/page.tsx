import type { Metadata } from "next"

import { GenderChart, SignupsChart } from "@/features/dashboard/view/admin-charts"
import { AdminQuickActions } from "@/features/dashboard/view/admin-quick-actions"
import { AdminRecentUsers } from "@/features/dashboard/view/admin-recent-users"
import { AdminStatCards } from "@/features/dashboard/view/admin-stat-cards"
import { DashboardGreeting } from "@/features/dashboard/view/dashboard-greeting"
import { loadAdminDashboardStats } from "@/features/dashboard/server/load-admin-dashboard-stats"
import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

export const metadata: Metadata = {
  title: "Dashboard - Orvantaa Admin",
  description: "Orvantaa admin overview",
}

export default async function DashboardPage() {
  const [{ firstName }, stats] = await Promise.all([
    loadDashboardUserProfile(),
    loadAdminDashboardStats(),
  ])

  const serverHour = new Date().getHours()

  return (
    <div className="flex flex-1 flex-col gap-5">
      <DashboardGreeting
        firstName={firstName}
        serverHour={serverHour}
        subtitle="Here's your platform overview for today."
      />

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <AdminStatCards counts={stats.counts} />

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SignupsChart data={stats.signupsLast14Days} />
        <GenderChart data={stats.genderBreakdown} />
      </div>

      {/* ── Recent users + Quick actions ─────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminRecentUsers users={stats.recentUsers} />
        <AdminQuickActions />
      </div>
    </div>
  )
}
