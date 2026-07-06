"use client"

import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import type { StudentNotificationSummary } from "@/features/notifications/model/notification"
import type { DashboardUserProfile } from "@/features/user/model/user"

import type { DashboardShellController } from "../controller/use-dashboard-shell-controller"
import { DashboardBottomNav } from "./dashboard-bottom-nav"
import { DashboardFloatingDock } from "./dashboard-floating-dock"
import { SidebarInsetHeader } from "./sidebar-inset-header"

export type DashboardShellViewProps = DashboardShellController & {
  userProfile: DashboardUserProfile
  notifications: StudentNotificationSummary
  children: React.ReactNode
}

export function DashboardShellView({
  navItems,
  pageTitle,
  isAiTutorPage,
  userProfile,
  notifications,
  children,
}: DashboardShellViewProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex min-h-svh w-full flex-col bg-[#f5f7ff]",
          isAiTutorPage && "h-svh max-h-svh overflow-hidden"
        )}
      >
        <SidebarInsetHeader
          pageTitle={pageTitle}
          userProfile={userProfile}
          notifications={notifications}
        />
        <main
          className={cn(
            "w-full",
            !isAiTutorPage &&
              "px-4 py-5 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-6 lg:pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]",
            isAiTutorPage && "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
          )}
        >
          {children}
        </main>
        <DashboardBottomNav navItems={navItems} />
        <DashboardFloatingDock navItems={navItems} />
      </div>
    </TooltipProvider>
  )
}
