"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { AtSign, Loader2, MoveLeft } from "lucide-react"
import Link from "next/link"

import type { ForgotPasswordController } from "../controller/use-forgot-password-controller"
import { AuthBrandMark, AuthCard, AuthPageShell } from "./auth-page-shell"

export type ForgotPasswordViewProps = ForgotPasswordController

export function ForgotPasswordView({
  emailError,
  clearEmailError,
  onSubmit,
  isSendingResetLink,
}: ForgotPasswordViewProps) {
  return (
    <AuthPageShell>
      <AuthCard>
        <AuthBrandMark className="mb-6" />
        <div className="space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
              Reset your password
            </h1>
            <p className="text-sm text-slate-500">
              Enter the email linked to your account. We will send a reset link
              if it exists.
            </p>
          </div>

          <form className="space-y-4" noValidate onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label
                htmlFor="forgot-email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </Label>
              <div className="relative">
                <AtSign
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="forgot-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={
                    emailError ? "forgot-password-email-error" : undefined
                  }
                  onChange={clearEmailError}
                  className="h-11 rounded-xl border border-[#E2E8F5] bg-[#F7F9FD] pl-10 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#4169E1]/45 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#4169E1]/20"
                />
              </div>
              {emailError ? (
                <p
                  id="forgot-password-email-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {emailError}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={isSendingResetLink}
              aria-busy={isSendingResetLink}
              className="h-11 w-full rounded-xl bg-[#4169E1] text-sm font-semibold text-white hover:bg-[#3558C8] disabled:opacity-80"
            >
              {isSendingResetLink ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Sending link...
                </span>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2">
            <MoveLeft className="size-4 shrink-0 text-slate-400" />
            <Link
              href="/auth"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  )
}
