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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div
        className={cn(
          "pointer-events-auto mx-auto w-full max-w-lg px-3",
          "pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        )}
      >
        <nav
          className={cn(
            "rounded-2xl border border-[#E0E7FF]/90 bg-white/90 shadow-[0_12px_40px_-16px_rgba(65,105,225,0.28)] ring-1 ring-[#E8EEFF]/80 backdrop-blur-xl",
            "supports-backdrop-filter:bg-white/80"
          )}
          aria-label="Primary navigation"
        >
          <ul className="grid grid-cols-4 gap-1 p-2">
            {navItems.map((item) => {
              const Icon =
                item.isActive && item.activeIcon ? item.activeIcon : item.icon

              return (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    prefetch
                    className={cn(
                      "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-semibold tracking-tight transition-all duration-200 ease-out",
                      "focus-visible:ring-2 focus-visible:ring-[#4169E1]/30 focus-visible:outline-none",
                      "active:scale-[0.97]",
                      item.isActive
                        ? "bg-gradient-to-b from-[#4169E1] to-[#5B7FE8] font-bold text-white shadow-[0_8px_20px_-8px_rgba(65,105,225,0.55)] [&_svg]:text-white"
                        : "text-[#3D5CC9] hover:bg-[#F0F4FF] hover:text-[#4169E1] [&_svg]:text-[#7B96ED] hover:[&_svg]:text-[#4169E1]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-7 shrink-0 transition-colors duration-200",
                        item.isActive ? "text-white" : "text-[#7B96ED]"
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
