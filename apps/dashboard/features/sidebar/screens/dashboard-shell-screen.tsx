"use client"

import { useDashboardShellController } from "../controller/use-dashboard-shell-controller"
import type { UserGender } from "../model/user-gender"
import { DashboardShellView } from "../view/dashboard-shell-view"

type DashboardShellScreenProps = {
  children: React.ReactNode
  defaultSidebarOpen?: boolean
  userGender: UserGender
}

export function DashboardShellScreen({
  children,
  defaultSidebarOpen = true,
  userGender,
}: DashboardShellScreenProps) {
  const controller = useDashboardShellController()

  return (
    <DashboardShellView
      {...controller}
      defaultSidebarOpen={defaultSidebarOpen}
      userGender={userGender}
    >
      {children}
    </DashboardShellView>
  )
}
