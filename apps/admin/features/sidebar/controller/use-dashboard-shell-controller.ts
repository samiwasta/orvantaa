"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

import type { LucideIcon } from "@workspace/ui/icons"
import {
  dashboardNavItems,
  isDashboardNavPathActive,
  resolveDashboardPageTitle,
} from "../model/navigation"

export type DashboardNavItemVM = {
  title: string
  mobileTitle: string
  href: string
  icon: LucideIcon
  isActive: boolean
}

export function useDashboardShellController() {
  const pathname = usePathname()

  const navItems = React.useMemo<DashboardNavItemVM[]>(() => {
    return dashboardNavItems.map((item) => ({
      ...item,
      mobileTitle: item.mobileTitle ?? item.title,
      isActive: isDashboardNavPathActive(pathname, item.href),
    }))
  }, [pathname])

  const pageTitle = React.useMemo(
    () => resolveDashboardPageTitle(pathname),
    [pathname]
  )

  return { navItems, pageTitle }
}

export type DashboardShellController = ReturnType<
  typeof useDashboardShellController
>
