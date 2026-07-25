"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Mic, UserRound, Video } from "lucide-react"
import { useEffect, useRef } from "react"

import type { ProctorBehaviorSignals } from "../controller/proctor-behavior-monitor"

type ProctorCameraPreviewProps = {
  stream: MediaStream | null
  signals?: ProctorBehaviorSignals | null
  className?: string
}

function statusTone(signals: ProctorBehaviorSignals | null | undefined) {
  if (!signals) return "idle"
  if (!signals.ready) return "warming"
  if (
    signals.obstructed ||
    signals.frozen ||
    signals.speaking ||
    (signals.faceTracking && signals.faceCount !== 1)
  ) {
    return "alert"
  }
  return "ok"
}

export function ProctorCameraPreview({
  stream,
  signals = null,
  className,
}: ProctorCameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const tone = statusTone(signals)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!stream) {
      video.srcObject = null
      return
    }

    video.srcObject = stream
    void video.play().catch(() => undefined)

    return () => {
      video.srcObject = null
    }
  }, [stream])

  if (!stream) return null

  const faceLabel = !signals?.faceTracking
    ? "Face AI loading"
    : !signals.ready
      ? "Calibrating"
      : signals.obstructed
        ? "Camera blocked"
        : signals.faceCount === 0
          ? "Face missing"
          : signals.faceCount > 1
            ? `${signals.faceCount} faces`
            : "Face OK"

  const voiceLabel = signals?.speaking ? "Speech" : "Quiet"

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-3 bottom-3 z-40 overflow-hidden rounded-2xl",
        "bg-black shadow-[0_12px_28px_-12px_rgba(0,0,0,0.55)] ring-2",
        tone === "alert" && "ring-amber-300",
        tone === "ok" && "ring-emerald-300/90",
        tone === "warming" && "ring-sky-300/90",
        tone === "idle" && "ring-white/80",
        "sm:right-5 sm:bottom-5",
        className
      )}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className="h-28 w-40 object-cover sm:h-32 sm:w-48"
        aria-label="Your camera preview"
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-1 bg-linear-to-b from-black/65 to-transparent px-2 py-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white",
            tone === "alert" ? "bg-amber-500/95" : "bg-emerald-500/90"
          )}
        >
          <span className="size-1.5 animate-pulse rounded-full bg-white" />
          {tone === "alert" ? "Alert" : "Live"}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/90">
          <Video className="size-3" aria-hidden />
          <Mic className="size-3" aria-hidden />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-1 bg-linear-to-t from-black/80 to-transparent px-2 pt-4 pb-1.5">
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-white">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <UserRound className="size-3 shrink-0 opacity-90" aria-hidden />
            {faceLabel}
          </span>
          <span className="shrink-0 opacity-90">{voiceLabel}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              signals?.speaking ? "bg-amber-400" : "bg-emerald-400"
            )}
            style={{
              width: `${Math.round((signals?.voiceLevel ?? 0) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
