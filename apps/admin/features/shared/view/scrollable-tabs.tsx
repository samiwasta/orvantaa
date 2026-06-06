import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

export type ScrollableTabItem = {
  id: string
  label: string
  mobileLabel?: string
  href: string
}

type ScrollableTabsProps = {
  items: ScrollableTabItem[]
  activeId: string
  ariaLabel?: string
  className?: string
}

export function ScrollableTabs({
  items,
  activeId,
  ariaLabel = "Sections",
  className,
}: ScrollableTabsProps) {
  return (
    <nav
      className={cn(
        "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      aria-label={ariaLabel}
    >
      <div className="flex min-w-max px-1 sm:px-2">
        {items.map(({ id, label, mobileLabel, href }) => {
          const active = activeId === id
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 lg:px-5",
                active
                  ? "border-[#6C5CE7] bg-white text-[#6C5CE7]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {mobileLabel ? (
                <>
                  <span className="sm:hidden">{mobileLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                </>
              ) : (
                label
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
