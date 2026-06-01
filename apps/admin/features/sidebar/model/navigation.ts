import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  School,
  Settings,
  Users,
} from "lucide-react"

export type DashboardNavItemDefinition = {
  title: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItemDefinition[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Content", href: "/content", icon: BookOpen },
  { title: "Students", href: "/students", icon: Users },
  { title: "Schools", href: "/schools", icon: School },
  { title: "Classes", href: "/classes", icon: GraduationCap },
  { title: "Boards", href: "/boards", icon: Landmark },
  { title: "Settings", href: "/settings", icon: Settings },
]

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/schools": "Schools",
  "/classes": "Classes",
  "/content": "Content",
  "/boards": "Boards",
  "/settings": "Settings",
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

  const exact = PAGE_TITLES[pathname]
  if (exact) return exact

  const prefixMatch = dashboardNavItems.find((item) =>
    isDashboardNavPathActive(pathname, item.href)
  )
  return prefixMatch?.title ?? "Orvantaa Admin"
}
