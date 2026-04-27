"use client"

import type { LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
  dashboardNavItems,
  isDashboardNavPathActive,
  resolveDashboardPageTitle,
} from "../model/navigation"

export type DashboardNavItemVM = {
  title: string
  href: string
  icon: LucideIcon
  isActive: boolean
}

export function useDashboardShellController() {
  const pathname = usePathname()

  const navItems = React.useMemo<DashboardNavItemVM[]>(() => {
    return dashboardNavItems.map((item) => ({
      ...item,
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
