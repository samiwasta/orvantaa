"use client"

import type { ComponentType, CSSProperties } from "react"

import { cn } from "../lib/utils"
import type { IconComponent, IconProps } from "./types"

type IconlyBaseProps = {
  set?: "light" | "bold" | "two-tone" | "bulk" | "broken" | "curved"
  primaryColor?: string
  secondaryColor?: string
  size?: number | "small" | "medium" | "large" | "xlarge"
  stroke?: "light" | "regular" | "bold"
  label?: string
  style?: CSSProperties
  filled?: boolean
}

export function parsePixelSize(
  className?: string,
  explicitSize?: number
): number {
  if (explicitSize) return explicitSize
  if (!className) return 20

  const sizeToken = className.match(/\bsize-(\d+(?:\.\d+)?)\b/)
  if (sizeToken) return Number(sizeToken[1]) * 4

  const dimToken = className.match(/\b(?:h|w)-(\d+(?:\.\d+)?)\b/)
  if (dimToken) return Number(dimToken[1]) * 4

  return 20
}

function resolveStroke(strokeWidth?: number): "light" | "regular" | "bold" {
  if (strokeWidth === undefined) return "regular"
  if (strokeWidth >= 2.5) return "bold"
  if (strokeWidth <= 1.5) return "light"
  return "regular"
}

export function createIcon(
  IconlyIcon: ComponentType<IconlyBaseProps>,
  options?: { defaultSize?: number }
): IconComponent {
  function Icon({
    className,
    size,
    strokeWidth,
    fill,
    style,
    onClick,
    "aria-hidden": ariaHidden = true,
  }: IconProps) {
    const pixelSize = parsePixelSize(className, size ?? options?.defaultSize)
    const isFilled = Boolean(fill && fill !== "none")

    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center leading-none",
          className
        )}
        style={style}
        onClick={onClick}
        aria-hidden={ariaHidden}
      >
        <IconlyIcon
          set={isFilled ? "bold" : "light"}
          filled={isFilled}
          stroke={resolveStroke(strokeWidth)}
          size={pixelSize}
          primaryColor="currentColor"
          secondaryColor="currentColor"
          label=""
          style={{ display: "block" }}
        />
      </span>
    )
  }

  Icon.displayName = "IconlyIcon"
  return Icon
}
