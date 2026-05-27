"use client"

import type { DashboardUserProfile } from "@/features/user/model/user"

import { useDashboardShellController } from "../controller/use-dashboard-shell-controller"
import { DashboardShellView } from "../view/dashboard-shell-view"

type DashboardShellScreenProps = {
  children: React.ReactNode
  defaultSidebarOpen?: boolean
  userProfile: DashboardUserProfile
}

export function DashboardShellScreen({
  children,
  defaultSidebarOpen = true,
  userProfile,
}: DashboardShellScreenProps) {
  const controller = useDashboardShellController()

  return (
    <DashboardShellView
      {...controller}
      defaultSidebarOpen={defaultSidebarOpen}
      userProfile={userProfile}
    >
      {children}
    </DashboardShellView>
  )
}
