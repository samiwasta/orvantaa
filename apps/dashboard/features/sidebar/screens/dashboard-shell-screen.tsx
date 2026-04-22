"use client"

import { useDashboardShellController } from "../controller/use-dashboard-shell-controller"
import { DashboardShellView } from "../view/dashboard-shell-view"

type DashboardShellScreenProps = {
  children: React.ReactNode
  defaultSidebarOpen?: boolean
}

export function DashboardShellScreen({
  children,
  defaultSidebarOpen = true,
}: DashboardShellScreenProps) {
  const controller = useDashboardShellController()

  return (
    <DashboardShellView {...controller} defaultSidebarOpen={defaultSidebarOpen}>
      {children}
    </DashboardShellView>
  )
}
