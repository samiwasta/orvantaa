"use client"

import { cn } from "@workspace/ui/lib/utils"
import type { LucideProps } from "lucide-react"
import { forwardRef, useId } from "react"

type OrvantaaAiIconProps = React.SVGProps<SVGSVGElement> & {
  animated?: boolean
}

export const OrvantaaAiIcon = forwardRef<SVGSVGElement, OrvantaaAiIconProps>(
  function OrvantaaAiIcon({ className, animated = true, ...props }, ref) {
    const uid = useId().replace(/:/g, "")
    const coreId = `orvantaa-ai-core-${uid}`
    const coreHighlightId = `orvantaa-ai-core-hi-${uid}`
    const ringId = `orvantaa-ai-ring-${uid}`
    const waveId = `orvantaa-ai-wave-${uid}`
    const sparkId = `orvantaa-ai-spark-${uid}`
    const clipId = `orvantaa-ai-clip-${uid}`
    const vignetteId = `orvantaa-ai-vignette-${uid}`

    return (
      <svg
        ref={ref}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden
        className={cn("orvantaa-ai-icon shrink-0", className)}
        {...props}
      >
        <defs>
          <radialGradient
            id={coreId}
            cx="38%"
            cy="32%"
            r="68%"
            gradientUnits="objectBoundingBox"
          >
            {animated ? (
              <>
                <stop offset="0%" stopColor="#c8bfff">
                  <animate
                    attributeName="stop-color"
                    values="#c8bfff;#b8b2ff;#c4b5fd;#b0c4ff;#c8bfff"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="42%" stopColor="#7b6cf2">
                  <animate
                    attributeName="stop-color"
                    values="#7b6cf2;#4169E1;#7480eb;#4169E1;#7b6cf2"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#2a265c">
                  <animate
                    attributeName="stop-color"
                    values="#2a265c;#2e2868;#282456;#2f2a6e;#2a265c"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                </stop>
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#c8bfff" />
                <stop offset="42%" stopColor="#7b6cf2" />
                <stop offset="100%" stopColor="#2a265c" />
              </>
            )}
          </radialGradient>

          <radialGradient
            id={coreHighlightId}
            cx="50%"
            cy="50%"
            r="50%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <radialGradient
            id={vignetteId}
            cx="50%"
            cy="50%"
            r="50%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="68%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#0f0d24" stopOpacity="0.45" />
          </radialGradient>

          <linearGradient
            id={ringId}
            x1="14"
            y1="10"
            x2="34"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            {animated ? (
              <>
                <stop offset="0%" stopColor="#f3f0ff">
                  <animate
                    attributeName="stop-color"
                    values="#f3f0ff;#ebe8ff;#f0f4ff;#f3f0ff"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="48%" stopColor="#9d8df5">
                  <animate
                    attributeName="stop-color"
                    values="#9d8df5;#8b7cf0;#9490f3;#9d8df5"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#6ec9e0">
                  <animate
                    attributeName="stop-color"
                    values="#6ec9e0;#7ab8e8;#68d4db;#6ec9e0"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                </stop>
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#f3f0ff" />
                <stop offset="48%" stopColor="#9d8df5" />
                <stop offset="100%" stopColor="#6ec9e0" />
              </>
            )}
          </linearGradient>

          <linearGradient
            id={waveId}
            x1="14"
            y1="24"
            x2="34"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <radialGradient
            id={sparkId}
            cx="50%"
            cy="50%"
            r="50%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <clipPath id={clipId}>
            <circle cx="24" cy="24" r="12.75" />
          </clipPath>
        </defs>

        <circle cx="24" cy="24" r="14.75" fill={`url(#${coreId})`} />

        <circle cx="24" cy="24" r="14.75" fill={`url(#${coreHighlightId})`} />

        <circle cx="24" cy="24" r="14.75" fill={`url(#${vignetteId})`} />

        <g clipPath={`url(#${clipId})`}>
          <path
            d="M11 24.25 C15.5 20.25, 18.5 26.75, 24 24.25 S32.5 20.25, 37 24.25"
            stroke={`url(#${waveId})`}
            strokeWidth="1.65"
            strokeLinecap="round"
            fill="none"
            opacity="0.88"
          >
            {animated ? (
              <animate
                attributeName="d"
                values="M11 24.25 C15.5 20.25, 18.5 26.75, 24 24.25 S32.5 20.25, 37 24.25;M11 24.25 C15.5 26.75, 18.5 20.25, 24 24.25 S32.5 26.75, 37 24.25;M11 24.25 C15.5 20.25, 18.5 26.75, 24 24.25 S32.5 20.25, 37 24.25"
                dur="7.5s"
                repeatCount="indefinite"
              />
            ) : null}
          </path>
          <path
            d="M13 27.25 C16.5 24.5, 19.5 28.75, 24 27.25 S30.5 24.5, 35 27.25"
            stroke={`url(#${waveId})`}
            strokeWidth="1.05"
            strokeLinecap="round"
            fill="none"
            opacity="0.38"
          >
            {animated ? (
              <animate
                attributeName="d"
                values="M13 27.25 C16.5 24.5, 19.5 28.75, 24 27.25 S30.5 24.5, 35 27.25;M13 27.25 C16.5 28.75, 19.5 24.5, 24 27.25 S30.5 28.75, 35 27.25;M13 27.25 C16.5 24.5, 19.5 28.75, 24 27.25 S30.5 24.5, 35 27.25"
                dur="8.5s"
                repeatCount="indefinite"
              />
            ) : null}
          </path>

          <circle cx="24" cy="24.25" r="2.75" fill={`url(#${sparkId})`}>
            {animated ? (
              <animate
                attributeName="opacity"
                values="0.82;1;0.82"
                dur="4.5s"
                repeatCount="indefinite"
              />
            ) : null}
          </circle>
        </g>

        <circle
          cx="24"
          cy="24"
          r="16.5"
          fill="none"
          stroke={`url(#${ringId})`}
          strokeWidth="3.15"
          strokeLinecap="round"
          strokeDasharray="90 14"
          transform="rotate(-90 24 24)"
          opacity="0.98"
        />
      </svg>
    )
  }
)

export const OrvantaaAiNavIcon = forwardRef<SVGSVGElement, LucideProps>(
  function OrvantaaAiNavIcon({ className, size = 24, ...props }, ref) {
    const dimension =
      typeof size === "number" ? size : Number.parseInt(String(size), 10) || 24

    return (
      <OrvantaaAiIcon
        ref={ref}
        width={dimension}
        height={dimension}
        className={cn("size-[1em]", className)}
        {...props}
      />
    )
  }
)
