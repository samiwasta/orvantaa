"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react"

import type { ResetPasswordController } from "../controller/use-reset-password-controller"
import { AuthMarketingColumn } from "./auth-marketing-column"

export type ResetPasswordViewProps = ResetPasswordController

export function ResetPasswordView({
  showPassword,
  showConfirmPassword,
  toggleShowPassword,
  toggleShowConfirmPassword,
  fieldErrors,
  clearFieldError,
  onSubmit,
  isResettingPassword,
}: ResetPasswordViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F3FF] p-4 lg:p-6 xl:p-8">
      <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 md:flex-row md:rounded-3xl">
        <AuthMarketingColumn />

        <section className="flex w-full flex-col justify-center bg-white px-4 py-6 sm:px-5 sm:py-8 md:w-1/2 md:px-5 md:py-8 lg:px-10 lg:py-10 xl:px-12">
          <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8 md:space-y-8 lg:space-y-12">
            <div className="space-y-1 text-center sm:space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem] lg:text-2xl">
                Set a new password
              </h1>
              <p className="text-sm text-muted-foreground lg:text-base">
                Enter your new password
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
                    <LockKeyhole
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground lg:left-3 lg:size-5"
                      aria-hidden
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      autoComplete="new-password"
                      placeholder="New Password"
                      aria-invalid={fieldErrors.newPassword ? true : undefined}
                      aria-describedby={
                        fieldErrors.newPassword
                          ? "reset-password-new-error"
                          : undefined
                      }
                      onChange={() => clearFieldError("newPassword")}
                      className="h-12 border-0 bg-[#F6F5F8] pr-10 pl-10 text-sm shadow-none placeholder:text-muted-foreground focus-visible:bg-[#F6F5F8] focus-visible:ring-2 focus-visible:ring-[#6366f1] lg:h-16 lg:pr-11 lg:pl-12 lg:text-base"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-200/80 hover:text-foreground lg:right-2.5 lg:size-8"
                      aria-label={
                        showPassword ? "Hide new password" : "Show new password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 lg:size-5" />
                      ) : (
                        <Eye className="size-4 lg:size-5" />
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
                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground lg:left-3 lg:size-5"
                      aria-hidden
                    />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      autoComplete="new-password"
                      placeholder="Confirm New Password"
                      aria-invalid={
                        fieldErrors.confirmNewPassword ? true : undefined
                      }
                      aria-describedby={
                        fieldErrors.confirmNewPassword
                          ? "reset-password-confirm-error"
                          : undefined
                      }
                      onChange={() => clearFieldError("confirmNewPassword")}
                      className="h-12 border-0 bg-[#F6F5F8] pr-10 pl-10 text-sm shadow-none placeholder:text-muted-foreground focus-visible:bg-[#F6F5F8] focus-visible:ring-2 focus-visible:ring-[#6366f1] lg:h-16 lg:pr-11 lg:pl-12 lg:text-base"
                    />
                    <button
                      type="button"
                      onClick={toggleShowConfirmPassword}
                      className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-200/80 hover:text-foreground lg:right-2.5 lg:size-8"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4 lg:size-5" />
                      ) : (
                        <Eye className="size-4 lg:size-5" />
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

              <Button
                type="submit"
                disabled={isResettingPassword}
                aria-busy={isResettingPassword}
                className="h-11 w-full rounded-lg bg-[#ff8c42] text-sm font-semibold text-white shadow-sm hover:bg-[#ff8c42]/92 disabled:opacity-90 lg:h-14 lg:text-base"
              >
                {isResettingPassword ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2
                      className="size-4 shrink-0 animate-spin lg:size-5"
                      aria-hidden
                    />
                    Resetting password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
