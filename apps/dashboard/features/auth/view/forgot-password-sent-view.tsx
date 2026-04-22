"use client"

import { Button } from "@workspace/ui/components/button"
import { CheckCircle2, MoveLeft } from "lucide-react"
import Link from "next/link"

import { AuthMarketingColumn } from "./auth-marketing-column"

export function ForgotPasswordSentView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F3FF] p-4 lg:p-6 xl:p-8">
      <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 md:flex-row md:rounded-3xl">
        <AuthMarketingColumn imageAlt="" />

        <section className="flex w-full flex-col justify-center bg-white px-4 py-6 sm:px-5 sm:py-8 md:w-1/2 md:px-5 md:py-8 lg:px-10 lg:py-10 xl:px-12">
          <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8 md:space-y-8 lg:space-y-10">
            <div className="flex flex-col items-center space-y-4 text-center sm:space-y-5">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25 lg:size-16">
                <CheckCircle2
                  className="size-8 lg:size-9"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem] lg:text-2xl">
                  Check your email
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">
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
                className="h-11 w-full rounded-lg bg-[#ff8c42] text-sm font-semibold text-white shadow-sm hover:bg-[#ff8c42]/92 lg:h-14 lg:text-base"
              >
                <Link href="/auth">Back to login</Link>
              </Button>

              <div className="flex items-center justify-center gap-2">
                <MoveLeft className="size-4 shrink-0 text-[#6B7280] lg:size-5" />
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#6B7280] hover:underline lg:text-sm"
                >
                  Use a different email
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
