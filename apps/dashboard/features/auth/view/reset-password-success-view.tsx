"use client"

import { Button } from "@workspace/ui/components/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { AuthBrandMark, AuthCard, AuthPageShell } from "./auth-page-shell"

export function ResetPasswordSuccessView() {
  return (
    <AuthPageShell>
      <AuthCard>
        <AuthBrandMark className="mb-6" />
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
              <CheckCircle2 className="size-8" strokeWidth={2} aria-hidden />
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
                Password updated
              </h1>
              <p className="text-sm leading-relaxed text-slate-500">
                Your password was changed successfully. You can sign in with
                your new password whenever you are ready.
              </p>
            </div>
          </div>

          <Button
            type="button"
            asChild
            className="h-11 w-full rounded-xl bg-[#4169E1] text-sm font-semibold text-white hover:bg-[#3558C8]"
          >
            <Link href="/auth">Continue to sign in</Link>
          </Button>
        </div>
      </AuthCard>
    </AuthPageShell>
  )
}
