import type { LucideIcon } from "lucide-react"
import { BookA, Bot, LayoutDashboard, LineChart } from "lucide-react"

export type DashboardNavItemDefinition = {
  title: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItemDefinition[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Subjects", href: "/subjects", icon: BookA },
  { title: "Performance", href: "/performance", icon: LineChart },
  { title: "AI Tutor", href: "/ai-tutor", icon: Bot },
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
  return match?.title ?? "Orvantaa"
}
