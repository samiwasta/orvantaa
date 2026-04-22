import { cookies } from "next/headers"

import { DashboardShellScreen } from "@/features/sidebar/screens/dashboard-shell-screen"
import { loadDashboardUserGender } from "@/features/sidebar/server/load-dashboard-user-gender"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get("sidebar_state")?.value
  const defaultSidebarOpen = sidebarState !== "false"
  const userGender = await loadDashboardUserGender()

  return (
    <DashboardShellScreen
      defaultSidebarOpen={defaultSidebarOpen}
      userGender={userGender}
    >
      {children}
    </DashboardShellScreen>
  )
}
