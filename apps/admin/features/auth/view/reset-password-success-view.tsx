"use client"

import { Button } from "@workspace/ui/components/button"
import { CheckCircle2, ShieldCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ResetPasswordSuccessView() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f4f4f8] px-4 py-10">
      <div className="w-full max-w-[400px] rounded-2xl border border-border/60 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/orvantaa-logo.png"
            alt="Orvantaa"
            width={140}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5 px-3 py-1 text-xs font-medium text-[#6366f1]">
            <ShieldCheck className="size-3.5" aria-hidden />
            Admin portal
          </div>
          <div className="mt-5 flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-7" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
            Password updated
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your new password to continue.
          </p>
        </div>

        <Button
          type="button"
          asChild
          className="h-11 w-full bg-[#6366f1] text-sm font-semibold text-white hover:bg-[#6366f1]/90"
        >
          <Link href="/auth">Continue to sign in</Link>
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Authorized personnel only
      </p>
    </div>
  )
}
