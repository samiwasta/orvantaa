"use client"

import { cn } from "@workspace/ui/lib/utils"
import { ShieldCheck } from "lucide-react"

type ProctorStatusBadgeProps = {
  warningCount: number
  warningLimit: number
  className?: string
}

export function ProctorStatusBadge({
  warningCount,
  warningLimit,
  className,
}: ProctorStatusBadgeProps) {
  const hasWarnings = warningCount > 0

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ring-1 backdrop-blur-sm",
        hasWarnings
          ? "bg-white text-amber-600 ring-white/80"
          : "bg-white/15 text-white ring-white/25",
        className
      )}
      aria-label={
        hasWarnings
          ? `Proctored attempt, ${warningCount} of ${warningLimit} warnings used`
          : "Proctored attempt"
      }
    >
      <ShieldCheck className="size-3.5" aria-hidden />
      <span>Proctored</span>
      {warningLimit > 0 ? (
        <span className="flex items-center gap-1" aria-hidden>
          {Array.from({ length: warningLimit }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "size-1.5 rounded-full",
                index < warningCount
                  ? hasWarnings
                    ? "bg-amber-500"
                    : "bg-white"
                  : hasWarnings
                    ? "bg-amber-200"
                    : "bg-white/40"
              )}
            />
          ))}
        </span>
      ) : null}
    </div>
  )
}
