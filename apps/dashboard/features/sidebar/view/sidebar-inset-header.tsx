"use client"

import { Button } from "@workspace/ui/components/button"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
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
  const isMobile = useIsMobile()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-4 md:px-6">
      {!isMobile ? <SidebarTrigger className="-ml-1 shrink-0" /> : null}
      <div className="flex w-full items-center justify-between gap-3">
        <div className="min-w-0">
          <h1
            className={cn(
              "m-0 flex h-8 min-w-0 shrink items-center",
              "font-heading text-lg leading-none font-semibold tracking-tight text-foreground"
            )}
          >
            {pageTitle}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <NotificationBell initialSummary={notifications} />
          <UserProfileMenu profile={userProfile} />
        </div>
      </div>
    </header>
  )
}
