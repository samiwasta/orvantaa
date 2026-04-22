"use client"

import { Button } from "@workspace/ui/components/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { AuthMarketingColumn } from "./auth-marketing-column"

export function ResetPasswordSuccessView() {
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
                  Password updated
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">
                  Your password was changed successfully. You can sign in with
                  your new password whenever you are ready.
                </p>
              </div>
            </div>

            <Button
              type="button"
              asChild
              className="h-11 w-full rounded-lg bg-[#ff8c42] text-sm font-semibold text-white shadow-sm hover:bg-[#ff8c42]/92 lg:h-14 lg:text-base"
            >
              <Link href="/auth">Continue to login</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
