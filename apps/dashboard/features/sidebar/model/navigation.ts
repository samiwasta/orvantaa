import type { IconComponent } from "@workspace/icons"
import {
  IconlyCategory,
  IconlyCategoryFilled,
  IconlyChart,
  IconlyChartFilled,
  IconlyDiscovery,
  IconlyDiscoveryFilled,
  IconlySearch,
  IconlySearchFilled,
} from "@workspace/icons"

export type DashboardNavItemDefinition = {
  title: string
  href: string
  icon: IconComponent
  activeIcon?: IconComponent
}

export const dashboardNavItems: DashboardNavItemDefinition[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: IconlyCategory,
    activeIcon: IconlyCategoryFilled,
  },
  {
    title: "Subjects",
    href: "/subjects",
    icon: IconlyDiscovery,
    activeIcon: IconlyDiscoveryFilled,
  },
  {
    title: "Performance",
    href: "/performance",
    icon: IconlyChart,
    activeIcon: IconlyChartFilled,
  },
  {
    title: "AI Tutor",
    href: "/ai-tutor",
    icon: IconlySearch,
    activeIcon: IconlySearchFilled,
  },
]

export function isDashboardNavPathActive(
  pathname: string,
  href: string
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isAiTutorPath(pathname: string): boolean {
  return isDashboardNavPathActive(pathname, "/ai-tutor")
}

export function resolveDashboardPageTitle(pathname: string): string {
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return "My Profile"
  }

  if (pathname === "/help" || pathname.startsWith("/help/")) {
    return "Help"
  }

  if (
    pathname === "/dashboard/goals" ||
    pathname.startsWith("/dashboard/goals/")
  ) {
    return "Goals"
  }

  if (pathname.match(/^\/subjects\/[^/]+\/[^/]+\/quiz\/[^/]+\/?$/)) {
    return "Quiz"
  }

  if (
    pathname.match(/^\/subjects\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/?$/) &&
    !pathname.includes("/quiz/")
  ) {
    return "Notes"
  }

  if (pathname.match(/^\/subjects\/[^/]+\/[^/]+\/?$/)) {
    return "Chapters"
  }

  if (pathname.match(/^\/subjects\/[^/]+\/?$/)) {
    return "Chapters"
  }

  const match = dashboardNavItems.find((item) =>
    isDashboardNavPathActive(pathname, item.href)
  )
  return match?.title ?? "Orvantaa"
}
