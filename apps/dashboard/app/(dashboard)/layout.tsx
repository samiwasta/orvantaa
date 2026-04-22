import { cookies } from "next/headers"

import { DashboardShellScreen } from "@/features/sidebar/screens/dashboard-shell-screen"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get("sidebar_state")?.value
  const defaultSidebarOpen = sidebarState !== "false"

  return (
    <DashboardShellScreen defaultSidebarOpen={defaultSidebarOpen}>
      {children}
    </DashboardShellScreen>
  )
}
