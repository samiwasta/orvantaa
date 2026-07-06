"use client"

import type { StudentNotificationSummary } from "@/features/notifications/model/notification"
import type { DashboardUserProfile } from "@/features/user/model/user"

import { useDashboardShellController } from "../controller/use-dashboard-shell-controller"
import { DashboardShellView } from "../view/dashboard-shell-view"

type DashboardShellScreenProps = {
  children: React.ReactNode
  userProfile: DashboardUserProfile
  notifications: StudentNotificationSummary
}

export function DashboardShellScreen({
  children,
  userProfile,
  notifications,
}: DashboardShellScreenProps) {
  const controller = useDashboardShellController()

  return (
    <DashboardShellView
      {...controller}
      userProfile={userProfile}
      notifications={notifications}
    >
      {children}
    </DashboardShellView>
  )
}
