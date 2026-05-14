"use client"

import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

import type { DashboardNavItemVM } from "../controller/use-dashboard-shell-controller"

export function DashboardBottomNav({
  navItems,
}: {
  navItems: DashboardNavItemVM[]
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div
        className={cn(
          "pointer-events-auto mx-auto w-full max-w-lg px-3",
          "pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        )}
      >
        <nav
          className={cn(
            "rounded-2xl border border-sidebar-border/70 bg-sidebar/95 shadow-lg ring-1 shadow-black/10 ring-sidebar-border/60 backdrop-blur-xl",
            "supports-backdrop-filter:bg-sidebar/85 dark:shadow-black/40 dark:ring-white/10"
          )}
          aria-label="Primary navigation"
        >
          <ul className="grid grid-cols-4 gap-0.5 p-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    prefetch
                    className={cn(
                      "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-semibold tracking-tight transition-[color,transform,background-color,box-shadow] duration-200 ease-out",
                      "focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/45 focus-visible:outline-none",
                      "active:scale-[0.96]",
                      item.isActive
                        ? "bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/35"
                        : "text-muted-foreground hover:bg-sidebar-accent/90 hover:text-foreground [&_svg]:text-muted-foreground hover:[&_svg]:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[22px] shrink-0 transition-colors duration-200",
                        item.isActive ? "text-white" : undefined
                      )}
                      strokeWidth={item.isActive ? 2.5 : 2}
                    />
                    <span className="max-w-full truncate text-center leading-none">
                      {item.title}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
