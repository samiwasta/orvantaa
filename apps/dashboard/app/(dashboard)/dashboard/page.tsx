import type { Metadata } from "next"

import { loadDashboardUserFirstName } from "@/features/dashboard/server/load-dashboard-user-first-name"
import { DashboardGreeting } from "@/features/dashboard/view/dashboard-greeting"
import { loadDashboardUserGender } from "@/features/sidebar/server/load-dashboard-user-gender"

import { DashboardBentoGrid } from "../../../features/dashboard/view/dashboard-bento-grid"

export const metadata: Metadata = {
  title: "Dashboard - Orvantaa",
  description: "Welcome to your Orvantaa dashboard",
}

export default async function DashboardPage() {
  const firstName = await loadDashboardUserFirstName()
  const userGender = await loadDashboardUserGender()
  const serverHour = new Date().getHours()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DashboardGreeting firstName={firstName} serverHour={serverHour} />
      <DashboardBentoGrid userGender={userGender} />
    </div>
  )
}
