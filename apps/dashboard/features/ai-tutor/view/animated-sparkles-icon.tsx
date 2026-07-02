"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Sparkles } from "lucide-react"
import { useId } from "react"

type AnimatedSparklesIconProps = {
  className?: string
  size?: number
  strokeWidth?: number
  animated?: boolean
}

export function AnimatedSparklesIcon({
  className,
  size = 24,
  strokeWidth = 2.25,
  animated = true,
}: AnimatedSparklesIconProps) {
  const uid = useId().replace(/:/g, "")
  const gradientId = `animated-sparkles-stroke-${uid}`
  const center = size / 2

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={size}
            y2={size}
          >
            {animated ? (
              <>
                <stop offset="0%" stopColor="#f5f0ff">
                  <animate
                    attributeName="stop-color"
                    values="#f5f0ff;#ede9fe;#f8f4ff;#ede9fe;#f5f0ff"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="45%" stopColor="#e9d8fd">
                  <animate
                    attributeName="stop-color"
                    values="#e9d8fd;#ddd6fe;#f3e8ff;#ddd6fe;#e9d8fd"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="72%" stopColor="#fcecc8">
                  <animate
                    attributeName="stop-color"
                    values="#fcecc8;#f8e4b8;#efe0ff;#f8e4b8;#fcecc8"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#ffffff">
                  <animate
                    attributeName="stop-color"
                    values="#ffffff;#faf7ff;#fffbeb;#faf7ff;#ffffff"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                </stop>
                <animateTransform
                  attributeName="gradientTransform"
                  type="rotate"
                  from={`0 ${center} ${center}`}
                  to={`360 ${center} ${center}`}
                  dur="12s"
                  repeatCount="indefinite"
                />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#f5f0ff" />
                <stop offset="45%" stopColor="#e9d8fd" />
                <stop offset="72%" stopColor="#fcecc8" />
                <stop offset="100%" stopColor="#ffffff" />
              </>
            )}
          </linearGradient>
        </defs>
      </svg>

      <Sparkles
        size={size}
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientId})`}
        className="drop-shadow-[0_2px_8px_rgba(237,233,254,0.45)]"
      />
    </span>
  )
}
