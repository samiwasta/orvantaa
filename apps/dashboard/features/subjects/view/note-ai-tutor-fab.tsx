"use client"

import {
  MOBILE_MEDIA_QUERY,
  useBodyScrollLock,
} from "@workspace/ui/hooks/use-body-scroll-lock"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"

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
  const close = () => onOpenChange(false)

  useBodyScrollLock(open, { mediaQuery: MOBILE_MEDIA_QUERY })

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
          onClick={close}
          aria-label="Close AI Tutor"
        />
      ) : null}

      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out",
          "right-4 bottom-[calc(5.75rem+0.75rem)] md:right-6 md:bottom-6",
          open
            ? "h-[min(calc(100dvh-9rem),34rem)] w-[min(calc(100vw-2rem),24rem)] md:h-[min(calc(100dvh-5rem),36rem)]"
            : "size-14"
        )}
      >
        {open ? (
          <div className="h-full origin-bottom-right animate-in duration-300 zoom-in-95 fade-in">
            <NoteAiTutorCard scope={scope} onClose={close} className="h-full" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              "bg-linear-to-br from-[#232061] via-[#1f1b57] to-[#171446]",
              "text-white shadow-[0_12px_32px_-8px_rgba(31,27,87,0.85)]",
              "ring-4 ring-white/90 transition-transform hover:scale-105 active:scale-95"
            )}
            aria-label="Open AI Tutor"
          >
            <Image
              src="/robot.svg"
              alt=""
              width={32}
              height={32}
              className="size-8 object-contain"
              aria-hidden
            />
          </button>
        )}
      </div>
    </>
  )
}
