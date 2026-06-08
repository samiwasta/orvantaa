import { cookies } from "next/headers"

import { loadStudentNotifications } from "@/features/notifications/server/load-student-notifications"
import { assertStudentSchoolAccess } from "@/features/schools/server/assert-student-school-access"
import { DashboardShellScreen } from "@/features/sidebar/screens/dashboard-shell-screen"
import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await assertStudentSchoolAccess()

  const cookieStore = await cookies()
  const sidebarState = cookieStore.get("sidebar_state")?.value
  const defaultSidebarOpen = sidebarState !== "false"
  const userProfile = await loadDashboardUserProfile()
  const notifications = await loadStudentNotifications()

  return (
    <DashboardShellScreen
      defaultSidebarOpen={defaultSidebarOpen}
      userProfile={userProfile}
      notifications={notifications}
    >
      {children}
    </DashboardShellScreen>
  )
}
