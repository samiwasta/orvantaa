"use client"

import { IconlySearch } from "@workspace/icons"
import {
  MOBILE_MEDIA_QUERY,
  useBodyScrollLock,
} from "@workspace/ui/hooks/use-body-scroll-lock"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useState } from "react"

import type { AiTutorWidgetScope } from "../model/ai-tutor-scope"
import { NoteAiTutorCard } from "./note-ai-tutor-card"

type NoteAiTutorFabProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: AiTutorWidgetScope
}

export function NoteAiTutorFab({
  open,
  onOpenChange,
  scope,
}: NoteAiTutorFabProps) {
  const [hasOpened, setHasOpened] = useState(open)
  const close = () => onOpenChange(false)

  useBodyScrollLock(open, { mediaQuery: MOBILE_MEDIA_QUERY })

  useEffect(() => {
    if (open) setHasOpened(true)
  }, [open])

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
          onClick={close}
          aria-label="Close AI Tutor"
        />
      ) : null}

      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out",
          "right-4 bottom-[calc(5.75rem+0.75rem)] md:right-6 md:bottom-6",
          open
            ? "h-[min(calc(100dvh-8rem),36rem)] w-[min(calc(100vw-1.5rem),26rem)] md:h-[min(calc(100dvh-4.5rem),38rem)]"
            : "size-[3.75rem]"
        )}
      >
        {hasOpened ? (
          <div
            className={cn(
              "h-full origin-bottom-right",
              open
                ? "animate-in duration-300 zoom-in-95 fade-in"
                : "pointer-events-none invisible absolute inset-0"
            )}
            aria-hidden={!open}
          >
            <NoteAiTutorCard scope={scope} onClose={close} className="h-full" />
          </div>
        ) : null}

        {!open ? (
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className={cn(
              "group relative flex size-[3.75rem] items-center justify-center rounded-full",
              "bg-linear-to-br from-[#4169E1] via-[#4169E1] to-[#5b4bc7]",
              "shadow-[0_14px_36px_-10px_rgba(65,105,225,0.75)]",
              "ring-2 ring-white transition-all duration-200",
              "hover:scale-[1.04] hover:shadow-[0_18px_40px_-10px_rgba(65,105,225,0.85)]",
              "active:scale-[0.98]"
            )}
            aria-label="Open AI Tutor"
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
            <IconlySearch
              size={28}
              color="white"
              className="relative"
              aria-hidden
            />
          </button>
        ) : null}
      </div>
    </>
  )
}
