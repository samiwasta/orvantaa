"use client"

import { cn } from "@workspace/ui/lib/utils"

type ProctorBlankOverlayProps = {
  active: boolean
}

/**
 * Covers the viewport with a solid blank frame so capture shortcuts / print
 * dumps cannot read quiz content when the handler wins the race.
 */
export function ProctorBlankOverlay({ active }: ProctorBlankOverlayProps) {
  if (!active) return null

  return (
    <div
      className={cn("fixed inset-0 z-[45] bg-black", "pointer-events-none")}
      aria-hidden
      data-proctor-blank=""
    />
  )
}
