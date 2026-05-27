import type { LucideIcon } from "lucide-react"
import { LayoutDashboard } from "lucide-react"

export type DashboardNavItemDefinition = {
  title: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItemDefinition[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

export function isDashboardNavPathActive(
  pathname: string,
  href: string
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function resolveDashboardPageTitle(pathname: string): string {
  const match = dashboardNavItems.find((item) =>
    isDashboardNavPathActive(pathname, item.href)
  )
  if (match) return match.title
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return "My Profile"
  }
  return "Orvantaa"
}
