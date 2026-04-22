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
  SidebarRail,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

import type { DashboardShellController } from "../controller/use-dashboard-shell-controller"

export type DashboardShellViewProps = DashboardShellController & {
  defaultSidebarOpen?: boolean
  children: React.ReactNode
}

export function DashboardShellView({
  navItems,
  pageTitle,
  defaultSidebarOpen = true,
  children,
}: DashboardShellViewProps) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <Sidebar collapsible="icon" variant="floating">
          <SidebarHeader className="border-b border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/dashboard" className="gap-2">
                    <div className="flex items-center justify-center gap-3">
                      <div className="size-9 shrink-0 rounded-lg bg-black/20 ring-1 ring-black/20" />
                      <span className="text-sm font-semibold tracking-[0.2em]">
                        ORVANTAA
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1">
                <SidebarMenu className="gap-2.5">
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href} className="py-0.5">
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        isActive={item.isActive}
                        tooltip={item.title}
                        className={cn(
                          "rounded-lg px-3 text-sm leading-snug font-medium",
                          "hover:bg-[#6C5CE7]/12 hover:text-sidebar-foreground",
                          "active:bg-[#6C5CE7]/16",
                          "data-active:bg-[#6C5CE7] data-active:text-white",
                          "data-active:[&_svg]:text-white",
                          "data-active:hover:bg-[#5d4ed6] data-active:hover:text-white data-active:hover:[&_svg]:text-white",
                          "focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/35",
                          "[&_svg]:size-5 [&_svg]:text-[#6C5CE7]",
                          "hover:[&_svg]:text-[#6C5CE7]"
                        )}
                      >
                        <Link href={item.href} className="gap-3">
                          <item.icon />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 px-4">
            <SidebarTrigger className="-ml-1" />
            <h1
              className={cn(
                "font-heading text-lg font-semibold tracking-tight text-foreground"
              )}
            >
              {pageTitle}
            </h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
