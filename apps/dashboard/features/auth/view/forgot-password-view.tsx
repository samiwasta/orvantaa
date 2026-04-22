"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { AtSign, Loader2, MoveLeft } from "lucide-react"
import Link from "next/link"

import type { ForgotPasswordController } from "../controller/use-forgot-password-controller"
import { AuthMarketingColumn } from "./auth-marketing-column"

export type ForgotPasswordViewProps = ForgotPasswordController

export function ForgotPasswordView({
  emailError,
  clearEmailError,
  onSubmit,
  isSendingResetLink,
}: ForgotPasswordViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F3FF] p-4 lg:p-6 xl:p-8">
      <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 md:flex-row md:rounded-3xl">
        <AuthMarketingColumn />

        <section className="flex w-full flex-col justify-center bg-white px-4 py-6 sm:px-5 sm:py-8 md:w-1/2 md:px-5 md:py-8 lg:px-10 lg:py-10 xl:px-12">
          <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8 md:space-y-8 lg:space-y-12">
            <div className="space-y-1 text-center sm:space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem] lg:text-2xl">
                Reset your password
              </h1>
              <p className="text-sm text-muted-foreground lg:text-base">
                Enter your email to reset your password
              </p>
            </div>

            <form
              className="space-y-4 sm:space-y-5 md:space-y-5 lg:space-y-6"
              noValidate
              onSubmit={onSubmit}
            >
              <div className="space-y-3 sm:space-y-3.5 md:space-y-3.5 lg:space-y-4">
                <div className="space-y-1.5">
                  <div className="relative">
                    <AtSign
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground lg:left-3 lg:size-5"
                      aria-hidden
                    />
                    <Input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Email"
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={
                        emailError ? "forgot-password-email-error" : undefined
                      }
                      onChange={clearEmailError}
                      className="h-12 border-0 bg-[#F6F5F8] pl-10 text-sm shadow-none placeholder:text-muted-foreground focus-visible:bg-[#F6F5F8] focus-visible:ring-2 focus-visible:ring-[#6366f1] lg:h-16 lg:pl-12 lg:text-base"
                    />
                  </div>
                  {emailError ? (
                    <p
                      id="forgot-password-email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {emailError}
                    </p>
                  ) : null}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSendingResetLink}
                aria-busy={isSendingResetLink}
                className="h-11 w-full rounded-lg bg-[#ff8c42] text-sm font-semibold text-white shadow-sm hover:bg-[#ff8c42]/92 disabled:opacity-90 lg:h-14 lg:text-base"
              >
                {isSendingResetLink ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2
                      className="size-4 shrink-0 animate-spin lg:size-5"
                      aria-hidden
                    />
                    Sending reset link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2">
                <MoveLeft className="size-4 shrink-0 text-[#6B7280] lg:size-5" />
                <Link
                  href="/auth"
                  className="text-xs font-medium text-[#6B7280] hover:underline lg:text-sm"
                >
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
