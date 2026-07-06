import type { LucideIcon } from "@workspace/ui/icons"
import {
  BookOpen,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  MessageCircleQuestion,
  School,
  UsersRound,
} from "@workspace/ui/icons"

export type DashboardNavItemDefinition = {
  title: string
  mobileTitle?: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItemDefinition[] = [
  { title: "Dashboard", mobileTitle: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Content", href: "/content", icon: BookOpen },
  { title: "Schools", href: "/schools", icon: School },
  { title: "Classes", href: "/classes", icon: GraduationCap },
  { title: "Boards", href: "/boards", icon: Landmark },
  { title: "Management", mobileTitle: "Manage", href: "/management", icon: UsersRound },
  { title: "Queries", href: "/queries", icon: MessageCircleQuestion },
]

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schools": "Schools",
  "/classes": "Classes",
  "/content": "Content",
  "/boards": "Boards",
  "/management": "Management",
  "/queries": "Queries",
  "/profile": "My Profile",
}

export function isDashboardNavPathActive(
  pathname: string,
  href: string
): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function resolveDashboardPageTitle(pathname: string): string {
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return PAGE_TITLES["/profile"] ?? "My Profile"
  }

  if (pathname.startsWith("/content/") && pathname !== "/content") {
    return "Content"
  }

  if (pathname.startsWith("/schools/") && pathname !== "/schools") {
    return "Schools"
  }

  if (pathname.startsWith("/queries/") && pathname !== "/queries") {
    return "Queries"
  }

  const exact = PAGE_TITLES[pathname]
  if (exact) return exact

  const prefixMatch = dashboardNavItems.find((item) =>
    isDashboardNavPathActive(pathname, item.href)
  )
  return prefixMatch?.title ?? "Orvantaa Admin"
}
