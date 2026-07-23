"use client"

import { cn } from "@workspace/ui/lib/utils"

import type { StudentNotificationSummary } from "@/features/notifications/model/notification"
import { NotificationBell } from "@/features/notifications/view/notification-bell"
import type { DashboardUserProfile } from "@/features/user/model/user"

import { UserProfileMenu } from "./user-profile-menu"

export function SidebarInsetHeader({
  pageTitle,
  userProfile,
  notifications,
}: {
  pageTitle: string
  userProfile: DashboardUserProfile
  notifications: StudentNotificationSummary
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 px-4 md:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center">
          <h1
            className={cn(
              "m-0 truncate font-heading text-lg leading-none font-semibold tracking-tight text-foreground"
            )}
          >
            {pageTitle}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <NotificationBell initialSummary={notifications} />
          <UserProfileMenu profile={userProfile} />
        </div>
      </div>
    </header>
  )
}
