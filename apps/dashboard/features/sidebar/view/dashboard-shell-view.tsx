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
import Image from "next/image"
import Link from "next/link"

import type { DashboardShellController } from "../controller/use-dashboard-shell-controller"
import type { UserGender } from "../model/user-gender"
import { DashboardBottomNav } from "./dashboard-bottom-nav"
import { SidebarInsetHeader } from "./sidebar-inset-header"

export type DashboardShellViewProps = DashboardShellController & {
  defaultSidebarOpen?: boolean
  userGender: UserGender
  children: React.ReactNode
}

function DashboardSidebarBrandLink() {
  const { state, isMobile } = useSidebar()
  const useIcon = state === "collapsed" && !isMobile

  return (
    <Link
      href="/dashboard"
      className="flex min-w-0 items-center justify-center px-1"
    >
      <Image
        src={useIcon ? "/orvantaa-icon.png" : "/orvantaa-logo.png"}
        alt="Orvantaa"
        width={useIcon ? 32 : 120}
        height={useIcon ? 32 : 32}
        className={
          useIcon
            ? "size-7 shrink-0 object-contain"
            : "my-2 h-7 w-auto max-w-[120px] shrink-0 object-contain sm:h-7 sm:max-w-[132px]"
        }
        priority
      />
    </Link>
  )
}

export function DashboardShellView({
  navItems,
  pageTitle,
  defaultSidebarOpen = true,
  userGender,
  children,
}: DashboardShellViewProps) {
  const isMobile = useIsMobile()

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        {!isMobile ? (
          <Sidebar collapsible="icon" variant="floating">
            {/* ── Brand header ───────────────────────────────────────────── */}
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    tooltip="Orvantaa"
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <DashboardSidebarBrandLink />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            {/* ── Nav items ──────────────────────────────────────────────── */}
            <SidebarContent className="px-2">
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-3 group-data-[collapsible=icon]:pt-4">
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          size="lg"
                          isActive={item.isActive}
                          tooltip={item.title}
                          className={cn(
                            "rounded-lg px-3 font-medium",
                            // icon sizing & default colour
                            "[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-[#6C5CE7]",
                            // hover
                            "hover:bg-[#6C5CE7]/10 hover:text-foreground",
                            "hover:[&_svg]:text-[#6C5CE7]",
                            // active
                            "data-active:bg-[#6C5CE7] data-active:text-white",
                            "data-active:[&_svg]:text-white",
                            "data-active:hover:bg-[#5d4ed6] data-active:hover:text-white",
                            "data-active:hover:[&_svg]:text-white",
                            // focus ring
                            "focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/40",
                            // collapsed: center the icon (span is removed from layout below)
                            "group-data-[collapsible=icon]:justify-center",
                            "group-data-[collapsible=icon]:rounded-lg"
                          )}
                        >
                          <Link href={item.href} className="gap-3">
                            <item.icon />
                            {/* hidden from layout (not just visibility) when collapsed
                              so justify-center can truly center the icon */}
                            <span className="group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        ) : null}

        <SidebarInset>
          <SidebarInsetHeader pageTitle={pageTitle} userGender={userGender} />
          <div
            className={cn(
              "flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6",
              isMobile && "pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]"
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
