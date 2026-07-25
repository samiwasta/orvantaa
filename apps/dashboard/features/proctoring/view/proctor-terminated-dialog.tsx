"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Loader2, OctagonAlert } from "lucide-react"

type ProctorTerminatedDialogProps = {
  open: boolean
  warningLimit: number
  answeredCount: number
  totalQuestions: number
  isSaving: boolean
  saveError: string | null
  onExit: () => void
  onRetrySave: () => void
}

export function ProctorTerminatedDialog({
  open,
  warningLimit,
  answeredCount,
  totalQuestions,
  isSaving,
  saveError,
  onExit,
  onRetrySave,
}: ProctorTerminatedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[200]"
        className="z-[200] flex w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-[1.5rem] border-red-100 p-0 sm:max-w-md"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-[#DC2626] via-[#E23B3B] to-[#F05252] px-5 py-5 sm:px-6">
          <div
            className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-white/15"
            aria-hidden
          />
          <DialogHeader className="relative gap-2 text-left">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-white/20 text-white">
                <OctagonAlert className="size-4" aria-hidden />
              </span>
              <p className="text-[11px] font-semibold tracking-wide text-white/85 uppercase">
                Attempt ended
              </p>
            </div>
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-white">
              All {warningLimit} warnings were used
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/85">
              This proctored attempt has been closed and cannot be continued.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6">
          <div className="rounded-2xl bg-[#F7F6FF] px-4 py-3.5 ring-1 ring-[#E8EEFF]">
            <p className="text-sm font-semibold text-foreground">
              {answeredCount} of {totalQuestions} answered
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Your answers so far are saved and scored. Unanswered questions
              count as incorrect.
            </p>
          </div>

          <p className="text-[13px] leading-relaxed text-muted-foreground">
            This quiz stays locked for you now. Talk to your teacher if you
            believe the warnings were recorded by mistake.
          </p>

          {saveError ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3.5 ring-1 ring-red-100">
              <p className="text-sm font-semibold text-red-700">
                We could not save your attempt
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-red-600/90">
                {saveError}
              </p>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-[#EEF1F8] bg-[#FAFBFF] px-5 py-4 sm:px-6">
          {saveError ? (
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onExit}
                className="h-11 w-full rounded-xl border-[#E4E9F5] bg-white px-5 text-sm font-semibold sm:w-auto"
              >
                Back to chapter
              </Button>
              <Button
                type="button"
                onClick={onRetrySave}
                disabled={isSaving}
                className="h-11 w-full rounded-xl bg-[#FF8A3D] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(255,138,61,0.8)] hover:bg-[#E8722A] sm:w-auto"
              >
                Try saving again
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={onExit}
              disabled={isSaving}
              className="h-11 w-full rounded-xl bg-[#6C5CE7] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(108,92,231,0.8)] hover:bg-[#5B4BD6]"
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving your attempt...
                </span>
              ) : (
                "Back to chapter"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
