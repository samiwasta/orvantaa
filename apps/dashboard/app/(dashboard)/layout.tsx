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

  const userProfile = await loadDashboardUserProfile()
  const notifications = await loadStudentNotifications()

  return (
    <DashboardShellScreen
      userProfile={userProfile}
      notifications={notifications}
    >
      {children}
    </DashboardShellScreen>
  )
}
