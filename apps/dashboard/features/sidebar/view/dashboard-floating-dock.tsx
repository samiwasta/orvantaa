"use client"

import {
  FloatingDock,
  type FloatingDockItem,
  type FloatingDockLinkProps,
} from "@workspace/ui/components/floating-dock"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

import type { DashboardNavItemVM } from "../controller/use-dashboard-shell-controller"

function DockLink({
  href,
  className,
  children,
  "aria-label": ariaLabel,
}: FloatingDockLinkProps) {
  return (
    <Link href={href} className={className} aria-label={ariaLabel} prefetch>
      {children}
    </Link>
  )
}

export function DashboardFloatingDock({
  navItems,
}: {
  navItems: DashboardNavItemVM[]
}) {
  const items: FloatingDockItem[] = navItems.map((item) => {
    const Icon = item.isActive && item.activeIcon ? item.activeIcon : item.icon

    return {
      title: item.title,
      href: item.href,
      isActive: item.isActive,
      icon: (
        <Icon
          className={cn(
            "size-full shrink-0",
            item.isActive ? "text-white" : "text-[#7B96ED]"
          )}
        />
      ),
    }
  })

  return (
    <div className="hidden lg:block">
      <FloatingDock
        items={items}
        linkComponent={DockLink}
        showMobile={false}
        desktopClassName="fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
      />
    </div>
  )
}
