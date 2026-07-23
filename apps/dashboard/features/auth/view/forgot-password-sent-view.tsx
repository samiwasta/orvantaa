"use client"

import { Button } from "@workspace/ui/components/button"
import { CheckCircle2, MoveLeft } from "lucide-react"
import Link from "next/link"

import { AuthBrandMark, AuthCard, AuthPageShell } from "./auth-page-shell"

export function ForgotPasswordSentView() {
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
                Check your email
              </h1>
              <p className="text-sm leading-relaxed text-slate-500">
                We sent a reset link to the address you entered. It may take a
                minute to arrive. If you do not see it in your inbox, look in
                your spam or junk folder.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="button"
              asChild
              className="h-11 w-full rounded-xl bg-[#4169E1] text-sm font-semibold text-white hover:bg-[#3558C8]"
            >
              <Link href="/auth">Back to sign in</Link>
            </Button>

            <div className="flex items-center justify-center gap-2">
              <MoveLeft className="size-4 shrink-0 text-slate-400" />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline"
              >
                Use a different email
              </Link>
            </div>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  )
}
