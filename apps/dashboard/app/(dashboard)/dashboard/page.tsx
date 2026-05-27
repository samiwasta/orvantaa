import type { Metadata } from "next"

import { DashboardGreeting } from "@/features/dashboard/view/dashboard-greeting"
import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

import { DashboardBentoGrid } from "../../../features/dashboard/view/dashboard-bento-grid"

export const metadata: Metadata = {
  title: "Dashboard - Orvantaa",
  description: "Welcome to your Orvantaa dashboard",
}

export default async function DashboardPage() {
  const { firstName, gender: userGender } = await loadDashboardUserProfile()
  const serverHour = new Date().getHours()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DashboardGreeting firstName={firstName} serverHour={serverHour} />
      <DashboardBentoGrid userGender={userGender} />
    </div>
  )
}
