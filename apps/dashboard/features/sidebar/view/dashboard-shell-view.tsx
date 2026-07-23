"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { cn } from "@workspace/ui/lib/utils"
import { Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import type { StudentNotificationSummary } from "@/features/notifications/model/notification"
import type { DashboardUserProfile } from "@/features/user/model/user"

import type { DashboardShellController } from "../controller/use-dashboard-shell-controller"
import { DashboardBottomNav } from "./dashboard-bottom-nav"
import { SidebarInsetHeader } from "./sidebar-inset-header"

export type DashboardShellViewProps = DashboardShellController & {
  defaultSidebarOpen?: boolean
  userProfile: DashboardUserProfile
  notifications: StudentNotificationSummary
  children: React.ReactNode
}

function DashboardSidebarHeader() {
  const { toggleSidebar, state, isMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile

  return (
    <div
      className={cn(
        "flex h-12 items-center gap-3",
        collapsed ? "justify-center" : "px-3"
      )}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center text-[#4169E1] transition-colors",
          "before:absolute before:rounded-lg before:transition-colors hover:before:bg-[#4169E1]/10",
          "focus-visible:outline-none focus-visible:before:ring-2 focus-visible:before:ring-[#4169E1]/30",
          collapsed ? "size-9 before:inset-0" : "size-5 before:-inset-1.5"
        )}
      >
        <Menu className="relative size-5" strokeWidth={2} aria-hidden />
      </button>
      {!collapsed ? (
        <Link
          href="/dashboard"
          className="flex h-full min-w-0 flex-1 items-center"
        >
          <Image
            src="/orvantaa-logo.png"
            alt="Orvantaa"
            width={120}
            height={32}
            className="h-7 w-auto max-w-[120px] shrink-0 object-contain object-left sm:max-w-[132px]"
            priority
          />
        </Link>
      ) : null}
    </div>
  )
}

export function DashboardShellView({
  navItems,
  pageTitle,
  isAiTutorPage,
  defaultSidebarOpen = true,
  userProfile,
  notifications,
  children,
}: DashboardShellViewProps) {
  const isMobile = useIsMobile()

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        {!isMobile ? (
          <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader className="px-2 py-0">
              <DashboardSidebarHeader />
            </SidebarHeader>

            <SidebarContent className="px-2">
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-3 group-data-[collapsible=icon]:pt-4">
                    {navItems.map((item) => {
                      const Icon =
                        item.isActive && item.activeIcon
                          ? item.activeIcon
                          : item.icon

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={item.isActive}
                            tooltip={item.title}
                            className={cn(
                              "rounded-lg px-3 font-medium",
                              "[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-[#7B96ED]",
                              "hover:bg-[#4169E1]/10 hover:text-[#4169E1]",
                              "hover:[&_svg]:text-[#4169E1]",
                              "data-active:bg-transparent! data-active:font-semibold data-active:text-[#4169E1]",
                              "data-active:[&_svg]:text-[#4169E1]",
                              "data-active:hover:bg-[#4169E1]/10! data-active:hover:text-[#4169E1]",
                              "data-active:hover:[&_svg]:text-[#4169E1]",
                              "focus-visible:ring-2 focus-visible:ring-[#4169E1]/40",
                              "group-data-[collapsible=icon]:justify-center",
                              "group-data-[collapsible=icon]:rounded-lg"
                            )}
                          >
                            <Link href={item.href} className="gap-3">
                              <Icon />
                              <span className="group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        ) : null}

        <SidebarInset
          className={cn(
            !isMobile && "md:pt-2",
            isAiTutorPage &&
              "h-svh max-h-svh min-h-0 overflow-x-hidden overflow-y-auto"
          )}
        >
          <SidebarInsetHeader
            pageTitle={pageTitle}
            userProfile={userProfile}
            notifications={notifications}
          />
          <div
            className={cn(
              "flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6",
              isMobile &&
                !isAiTutorPage &&
                "pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]",
              isAiTutorPage && "min-h-0 flex-1 gap-0 overflow-visible p-0"
            )}
          >
            {children}
          </div>
        </SidebarInset>
        {isMobile ? <DashboardBottomNav navItems={navItems} /> : null}
      </SidebarProvider>
    </TooltipProvider>
  )
}
