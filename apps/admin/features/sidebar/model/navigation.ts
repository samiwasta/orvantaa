import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  School,
  UsersRound,
} from "lucide-react"

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
]

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schools": "Schools",
  "/classes": "Classes",
  "/content": "Content",
  "/boards": "Boards",
  "/management": "Management",
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

  const exact = PAGE_TITLES[pathname]
  if (exact) return exact

  const prefixMatch = dashboardNavItems.find((item) =>
    isDashboardNavPathActive(pathname, item.href)
  )
  return prefixMatch?.title ?? "Orvantaa Admin"
}
