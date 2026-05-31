import { cn } from "@workspace/ui/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

import type { ContentBreadcrumb } from "../model/content-nav"

type ContentBreadcrumbsProps = {
  items: ContentBreadcrumb[]
}

export function ContentBreadcrumbs({ items }: ContentBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={item.href} className="inline-flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight
                className="size-3.5 text-muted-foreground/50"
                aria-hidden
              />
            ) : null}
            {isLast ? (
              <span
                aria-current="page"
                className="font-medium text-foreground"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-[#6C5CE7]"
                )}
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
