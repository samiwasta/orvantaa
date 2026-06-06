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
          "pointer-events-auto mx-auto w-full max-w-md px-4 sm:px-5",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        )}
      >
        <nav
          className={cn(
            "overflow-hidden rounded-2xl border border-border/50",
            "bg-background/90 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]",
            "ring-1 ring-black/[0.05] backdrop-blur-xl",
            "supports-backdrop-filter:bg-background/75",
            "dark:border-white/10 dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.55)] dark:ring-white/10"
          )}
          aria-label="Primary navigation"
        >
          <ul
            className="grid gap-0.5 p-1 pb-1.5"
            style={{
              gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
            }}
          >
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isFirst = index === 0
              const isLast = index === navItems.length - 1

              return (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    prefetch
                    className={cn(
                      "flex w-full min-w-0 flex-col items-center justify-center gap-1 px-0.5 pt-2 pb-2.5",
                      "text-[10px] font-semibold leading-tight tracking-tight transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/45 focus-visible:outline-none",
                      item.isActive
                        ? cn(
                            "bg-[#6C5CE7] text-white",
                            isFirst && isLast && "rounded-xl",
                            isFirst &&
                              !isLast &&
                              "rounded-l-xl rounded-r-lg",
                            isLast &&
                              !isFirst &&
                              "rounded-l-lg rounded-r-xl",
                            !isFirst && !isLast && "rounded-xl"
                          )
                        : "rounded-xl text-muted-foreground active:bg-muted/70 [&_svg]:text-muted-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[22px] shrink-0 transition-colors duration-200",
                        item.isActive ? "text-white" : undefined
                      )}
                      strokeWidth={item.isActive ? 2.5 : 2}
                    />
                    <span className="block w-full truncate px-0.5 pb-px text-center leading-tight">
                      {item.mobileTitle}
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
