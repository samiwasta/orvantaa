"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react"
import Image from "next/image"

import type { ResetPasswordController } from "../controller/use-reset-password-controller"

export type ResetPasswordViewProps = ResetPasswordController

export function ResetPasswordView({
  showPassword,
  showConfirmPassword,
  toggleShowPassword,
  toggleShowConfirmPassword,
  fieldErrors,
  formError,
  clearFieldError,
  onSubmit,
  isResettingPassword,
  canSubmit,
}: ResetPasswordViewProps) {
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
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
            Set your password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a secure password for your admin account
          </p>
        </div>

        <form className="space-y-5" noValidate onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New password
              </Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  disabled={!canSubmit}
                  aria-invalid={fieldErrors.newPassword ? true : undefined}
                  aria-describedby={
                    fieldErrors.newPassword ? "reset-password-new-error" : undefined
                  }
                  onChange={() => clearFieldError("newPassword")}
                  className="h-11 border-input bg-background pr-10 pl-10"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  disabled={!canSubmit}
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label={showPassword ? "Hide new password" : "Show new password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.newPassword ? (
                <p
                  id="reset-password-new-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {fieldErrors.newPassword}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  disabled={!canSubmit}
                  aria-invalid={fieldErrors.confirmNewPassword ? true : undefined}
                  aria-describedby={
                    fieldErrors.confirmNewPassword
                      ? "reset-password-confirm-error"
                      : undefined
                  }
                  onChange={() => clearFieldError("confirmNewPassword")}
                  className="h-11 border-input bg-background pr-10 pl-10"
                />
                <button
                  type="button"
                  onClick={toggleShowConfirmPassword}
                  disabled={!canSubmit}
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmNewPassword ? (
                <p
                  id="reset-password-confirm-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {fieldErrors.confirmNewPassword}
                </p>
              ) : null}
            </div>
          </div>

          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isResettingPassword || !canSubmit}
            aria-busy={isResettingPassword}
            className="h-11 w-full bg-[#6366f1] text-sm font-semibold text-white hover:bg-[#6366f1]/90"
          >
            {isResettingPassword ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving password...
              </span>
            ) : (
              "Set password"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Authorized personnel only
      </p>
    </div>
  )
}
