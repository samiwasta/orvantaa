"use client"

import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { cn } from "@workspace/ui/lib/utils"

import type { AdminNotificationSummary } from "@/features/notifications/model/notification"
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
  notifications: AdminNotificationSummary
}) {
  const isMobile = useIsMobile()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-3 pt-4 sm:gap-3 sm:px-4 sm:pt-5 md:px-6 md:pt-6">
      {!isMobile ? <SidebarTrigger className="-ml-1 shrink-0" /> : null}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <h1
          className={cn(
            "m-0 min-w-0 truncate font-heading text-base leading-none font-semibold tracking-tight text-foreground sm:text-lg"
          )}
        >
          {pageTitle}
        </h1>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <NotificationBell initialSummary={notifications} />
          <UserProfileMenu profile={userProfile} />
        </div>
      </div>
    </header>
  )
}
