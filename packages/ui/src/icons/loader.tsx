"use client"

import { cn } from "../lib/utils"
import { parsePixelSize } from "./create-icon"
import type { IconProps } from "./types"

export function Loader2({ className, size, strokeWidth }: IconProps) {
  const pixelSize = parsePixelSize(className, size ?? 20)
  const borderWidth = strokeWidth ?? 2

  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        className
      )}
      style={{
        width: pixelSize,
        height: pixelSize,
        borderWidth,
      }}
      aria-hidden
    />
  )
}
