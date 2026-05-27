import type { Metadata } from "next"

import { DashboardGreeting } from "@/features/dashboard/view/dashboard-greeting"
import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

export const metadata: Metadata = {
  title: "Dashboard - Orvantaa Admin",
  description: "Orvantaa admin dashboard",
}

export default async function DashboardPage() {
  const { firstName } = await loadDashboardUserProfile()
  const serverHour = new Date().getHours()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DashboardGreeting firstName={firstName} serverHour={serverHour} />
      <p className="text-sm text-muted-foreground">
        Welcome to the Orvantaa admin portal.
      </p>
    </div>
  )
}
