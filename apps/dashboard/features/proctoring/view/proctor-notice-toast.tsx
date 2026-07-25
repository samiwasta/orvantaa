"use client"

import { Ban } from "lucide-react"

import type { ProctorNotice } from "../controller/use-quiz-proctor"
import { proctorViolationRule } from "../model/proctor-rules"

type ProctorNoticeToastProps = {
  notice: ProctorNotice | null
}

export function ProctorNoticeToast({ notice }: ProctorNoticeToastProps) {
  if (!notice) return null

  const rule = proctorViolationRule(notice.kind)

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex max-w-sm items-center gap-2.5 rounded-full bg-slate-900/92 px-4 py-2.5 text-white shadow-[0_18px_36px_-18px_rgba(15,23,42,0.9)] backdrop-blur-sm">
        <Ban className="size-4 shrink-0 text-amber-300" aria-hidden />
        <p className="text-[13px] font-medium">{rule.title}</p>
        <span className="text-[11px] text-white/60">Noted, no warning</span>
      </div>
    </div>
  )
}
