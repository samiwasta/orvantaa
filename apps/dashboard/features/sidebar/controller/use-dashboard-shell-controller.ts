"use client"

import type { LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
  dashboardNavItems,
  isAiTutorPath,
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

  const isAiTutorPage = React.useMemo(() => isAiTutorPath(pathname), [pathname])

  return { navItems, pageTitle, isAiTutorPage }
}

export type DashboardShellController = ReturnType<
  typeof useDashboardShellController
>
