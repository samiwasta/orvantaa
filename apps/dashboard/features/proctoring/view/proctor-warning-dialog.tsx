"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { AlertTriangle, ShieldAlert } from "lucide-react"

import type { ProctorWarning } from "../controller/use-quiz-proctor"
import { proctorViolationRule, warningsRemaining } from "../model/proctor-rules"

type ProctorWarningDialogProps = {
  warning: ProctorWarning | null
  onAcknowledge: () => void
}

export function ProctorWarningDialog({
  warning,
  onAcknowledge,
}: ProctorWarningDialogProps) {
  const rule = warning ? proctorViolationRule(warning.kind) : null
  const remaining = warning
    ? warningsRemaining(warning.warningNumber, warning.warningLimit)
    : 0

  return (
    <Dialog open={Boolean(warning)} onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[200]"
        className="z-[200] flex w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-[1.5rem] border-amber-100 p-0 sm:max-w-md"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-[#F59E0B] via-[#F0A02A] to-[#FBBF24] px-5 py-5 sm:px-6">
          <div
            className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-white/15"
            aria-hidden
          />
          <DialogHeader className="relative gap-2 text-left">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-white/20 text-white">
                <AlertTriangle className="size-4" aria-hidden />
              </span>
              <p className="text-[11px] font-semibold tracking-wide text-white/85 uppercase">
                Warning {warning?.warningNumber ?? 0} of{" "}
                {warning?.warningLimit ?? 0}
              </p>
            </div>
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-white">
              {rule?.title ?? "Proctoring warning"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/85">
              {rule?.message ?? ""}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: warning?.warningLimit ?? 0 }).map(
              (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    index < (warning?.warningNumber ?? 0)
                      ? "bg-amber-500"
                      : "bg-[#EEF1F8]"
                  )}
                />
              )
            )}
          </div>

          <div className="flex gap-3 rounded-2xl bg-[#F7F6FF] px-4 py-3.5 ring-1 ring-[#E8EEFF]">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#6C5CE7] ring-1 ring-[#E4E9F5]">
              <ShieldAlert className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {remaining === 0
                  ? "This was your last chance"
                  : remaining === 1
                    ? "1 warning left"
                    : `${remaining} warnings left`}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {rule?.guidance ?? ""} Your attempt ends automatically once all{" "}
                {warning?.warningLimit ?? 0} warnings are used.
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#EEF1F8] bg-[#FAFBFF] px-5 py-4 sm:px-6">
          <Button
            type="button"
            onClick={onAcknowledge}
            className="h-11 w-full rounded-xl bg-[#FF8A3D] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(255,138,61,0.8)] hover:bg-[#E8722A]"
          >
            I understand, continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
