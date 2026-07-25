"use client"

import { cn } from "@workspace/ui/lib/utils"
import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react"

type QuizAnswerFeedbackProps = {
  isCorrect: boolean
  isRetryScheduled: boolean
  hint: string | null
  hintLoading: boolean
  hintError: string | null
}

export function QuizAnswerFeedback({
  isCorrect,
  isRetryScheduled,
  hint,
  hintLoading,
  hintError,
}: QuizAnswerFeedbackProps) {
  return (
    <div
      className={cn(
        "mt-5 space-y-3 rounded-2xl px-4 py-4 ring-1",
        isCorrect
          ? "bg-emerald-50/90 ring-emerald-100"
          : "bg-amber-50/90 ring-amber-100"
      )}
      aria-live="polite"
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
            isCorrect
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          )}
        >
          {isCorrect ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : (
            <XCircle className="size-4" aria-hidden />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {isCorrect
              ? "Nice — that is correct"
              : "Not quite — learn from this"}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {isCorrect
              ? "Solid thinking. Keep that idea ready for the next question."
              : "Mistakes are part of learning. Use the hint below, then this question will come back after a few more so you can try again."}
          </p>
          {!isCorrect && isRetryScheduled ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-800">
              <RotateCcw className="size-3.5" aria-hidden />
              Scheduled for a later retry
            </p>
          ) : null}
        </div>
      </div>

      {!isCorrect ? (
        <div className="rounded-xl bg-white/80 px-3.5 py-3 ring-1 ring-amber-100/80">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#6C5CE7]">
              {hintLoading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Lightbulb className="size-3.5" aria-hidden />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-[#6C5CE7] uppercase">
                Soft AI hint
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground">
                {hintLoading
                  ? "Thinking of a gentle nudge for you..."
                  : hintError
                    ? hintError
                    : hint ||
                      "Focus on the core idea behind the question, not the wording of any single option."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
