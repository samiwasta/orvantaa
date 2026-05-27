import { cookies } from "next/headers"

import { DashboardShellScreen } from "@/features/sidebar/screens/dashboard-shell-screen"
import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get("sidebar_state")?.value
  const defaultSidebarOpen = sidebarState !== "false"
  const userProfile = await loadDashboardUserProfile()

  return (
    <DashboardShellScreen
      defaultSidebarOpen={defaultSidebarOpen}
      userProfile={userProfile}
    >
      {children}
    </DashboardShellScreen>
  )
}
