"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react"

import type { ResetPasswordController } from "../controller/use-reset-password-controller"
import { AuthBrandMark, AuthCard, AuthPageShell } from "./auth-page-shell"

export type ResetPasswordViewProps = ResetPasswordController & {
  title?: string
  description?: string
  submitLabel?: string
  pendingLabel?: string
}

const inputClassName =
  "h-11 rounded-xl border border-[#E2E8F5] bg-[#F7F9FD] pr-10 pl-10 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#4169E1]/45 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#4169E1]/20"

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
  title = "Set a new password",
  description = "Choose a new password for your account.",
  submitLabel = "Reset password",
  pendingLabel = "Resetting password...",
}: ResetPasswordViewProps) {
  return (
    <AuthPageShell>
      <AuthCard>
        <AuthBrandMark className="mb-6" />
        <div className="space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>

          <form className="space-y-4" noValidate onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-slate-700"
              >
                New password
              </Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="New password"
                  aria-invalid={fieldErrors.newPassword ? true : undefined}
                  aria-describedby={
                    fieldErrors.newPassword
                      ? "reset-password-new-error"
                      : undefined
                  }
                  onChange={() => clearFieldError("newPassword")}
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={
                    showPassword ? "Hide new password" : "Show new password"
                  }
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
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {fieldErrors.newPassword}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmNewPassword"
                className="text-sm font-medium text-slate-700"
              >
                Confirm password
              </Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  aria-invalid={
                    fieldErrors.confirmNewPassword ? true : undefined
                  }
                  aria-describedby={
                    fieldErrors.confirmNewPassword
                      ? "reset-password-confirm-error"
                      : undefined
                  }
                  onChange={() => clearFieldError("confirmNewPassword")}
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={toggleShowConfirmPassword}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {fieldErrors.confirmNewPassword}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isResettingPassword || !canSubmit}
              aria-busy={isResettingPassword}
              className={cn(
                "h-11 w-full rounded-xl bg-[#4169E1] text-sm font-semibold text-white hover:bg-[#3558C8] disabled:opacity-80"
              )}
            >
              {isResettingPassword ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2
                    className="size-4 shrink-0 animate-spin"
                    aria-hidden
                  />
                  {pendingLabel}
                </span>
              ) : (
                submitLabel
              )}
            </Button>
          </form>
        </div>
      </AuthCard>
    </AuthPageShell>
  )
}
