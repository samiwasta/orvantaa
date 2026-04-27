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
} from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

import type { DashboardShellController } from "../controller/use-dashboard-shell-controller"
import type { UserGender } from "../model/user-gender"
import { SidebarInsetHeader } from "./sidebar-inset-header"

export type DashboardShellViewProps = DashboardShellController & {
  defaultSidebarOpen?: boolean
  userGender: UserGender
  children: React.ReactNode
}

export function DashboardShellView({
  navItems,
  pageTitle,
  defaultSidebarOpen = true,
  userGender,
  children,
}: DashboardShellViewProps) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
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
                  <Link href="/dashboard" className="gap-3 px-1">
                    {/* logo square — always visible */}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/20" />
                    {/* brand name — hidden from layout in icon mode */}
                    <span className="text-sm font-semibold tracking-[0.2em] group-data-[collapsible=icon]:hidden">
                      ORVANTAA
                    </span>
                  </Link>
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

        {/* ── Main content area ────────────────────────────────────────── */}
        <SidebarInset>
          <SidebarInsetHeader pageTitle={pageTitle} userGender={userGender} />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
