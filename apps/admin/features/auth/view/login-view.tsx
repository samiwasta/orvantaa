"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react"
import Image from "next/image"

import type { LoginController } from "../controller/use-login-controller"

export type LoginViewProps = LoginController

export function LoginView({
  showPassword,
  toggleShowPassword,
  fieldErrors,
  formError,
  clearFieldError,
  onSubmit,
  isLoggingIn,
}: LoginViewProps) {
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
            Sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your admin credentials to continue
          </p>
        </div>

        <form className="space-y-5" noValidate onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                Username or email
              </Label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="you@orvantaa.com"
                  aria-invalid={fieldErrors.username ? true : undefined}
                  aria-describedby={
                    fieldErrors.username ? "login-username-error" : undefined
                  }
                  onChange={() => clearFieldError("username")}
                  className="h-11 border-input bg-background pl-10"
                />
              </div>
              {fieldErrors.username ? (
                <p
                  id="login-username-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {fieldErrors.username}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={
                    fieldErrors.password ? "login-password-error" : undefined
                  }
                  onChange={() => clearFieldError("password")}
                  className="h-11 border-input bg-background pr-10 pl-10"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p
                  id="login-password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {fieldErrors.password}
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

          <div className="flex items-center gap-2">
            <Checkbox id="remember" name="rememberMe" />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-sm font-normal text-muted-foreground"
            >
              Remember for 30 days
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoggingIn}
            aria-busy={isLoggingIn}
            className="h-11 w-full bg-[#6366f1] text-sm font-semibold text-white hover:bg-[#6366f1]/90"
          >
            {isLoggingIn ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Signing in...
              </span>
            ) : (
              "Sign in"
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
