"use client"

import type { IconComponent } from "@workspace/icons"
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
  icon: IconComponent
  activeIcon?: IconComponent
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
