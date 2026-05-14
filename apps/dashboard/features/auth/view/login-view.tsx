"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react"
import Image from "next/image"

import type { LoginController } from "../controller/use-login-controller"

const features = [
  {
    image: "/graph.svg",
    title: "Performance tracking",
    placement: "left-[2%] top-[4%] sm:left-[5%] sm:top-[7%]",
  },
  {
    image: "/quiz.svg",
    title: "Smart quizzes",
    placement: "right-[2%] top-[14%] sm:right-[4%] sm:top-[24%]",
  },
  {
    image: "/book.svg",
    title: "Chapter-based learning",
    placement: "left-[0%] bottom-[38%] sm:left-[-2%] sm:bottom-[25%]",
  },
  {
    image: "/robot.svg",
    title: "AI Tutor support",
    placement: "right-[1%] bottom-[9%] sm:right-[-3%] sm:bottom-[11%]",
  },
] as const

export type LoginViewProps = LoginController

export function LoginView({
  showPassword,
  toggleShowPassword,
  fieldErrors,
  clearFieldError,
  onSubmit,
  isLoggingIn,
}: LoginViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F3FF] p-4 lg:p-6 xl:p-8">
      <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 md:flex-row md:rounded-3xl">
        <section className="relative flex min-h-0 w-full flex-col justify-between gap-4 bg-[#6366f1] p-6 text-white md:min-h-[560px] md:w-1/2 lg:min-h-[600px] lg:p-10">
          <div className="flex items-center justify-center">
            <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm ring-1 shadow-black/15 ring-black/5">
              <Image
                src="/orvantaa-logo.png"
                alt="Orvantaa"
                width={120}
                height={32}
                className="h-6 w-auto max-w-[120px] object-contain sm:h-7 sm:max-w-[132px]"
                priority
              />
            </div>
          </div>

          <div className="relative mx-auto hidden min-h-[260px] w-full max-w-lg flex-1 flex-col items-center justify-center py-4 md:flex md:min-h-[280px] md:py-4 lg:min-h-[320px] lg:py-6">
            <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={cn(
                    "absolute z-20 inline-flex w-max max-w-[calc(100%-0.75rem)] items-center gap-1.5 rounded-lg border border-white/45 bg-white/20 px-2 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] ring-1 ring-white/25 backdrop-blur-xl lg:gap-2 lg:rounded-xl lg:px-2.5 lg:py-2",
                    feature.placement
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white/35 ring-1 ring-white/30 backdrop-blur-sm lg:size-8">
                    <Image
                      src={feature.image}
                      alt=""
                      width={18}
                      height={18}
                      className="size-[14px] object-contain lg:size-4"
                    />
                  </span>
                  <p className="text-[10px] leading-tight font-medium tracking-tight text-balance text-slate-900 sm:text-[11px] lg:text-xs lg:font-semibold">
                    {feature.title}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative z-0 flex w-full justify-center px-3">
              <Image
                src="/girl-with-laptop.svg"
                alt="Girl with laptop"
                width={400}
                height={400}
                className="h-auto max-h-[min(52vh,400px)] w-full max-w-[400px] object-contain object-bottom"
                priority
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 text-center">
            <h2 className="font-heading text-xl leading-snug font-bold lg:text-2xl">
              Learn smarter, not harder
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/90">
              Practice concepts, track your progress, and improve with
              AI-powered learning.
            </p>
          </div>
        </section>

        <section className="flex w-full flex-col justify-center bg-white px-4 py-6 sm:px-5 sm:py-8 md:w-1/2 md:px-5 md:py-8 lg:px-10 lg:py-10 xl:px-12">
          <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8 md:space-y-8 lg:space-y-12">
            <div className="space-y-1 text-center sm:space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem] lg:text-2xl">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground lg:text-base">
                Log in using your credentials
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
                    <UserRound
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground lg:left-3 lg:size-5"
                      aria-hidden
                    />
                    <Input
                      type="text"
                      name="username"
                      autoComplete="username"
                      placeholder="Username"
                      aria-invalid={fieldErrors.username ? true : undefined}
                      aria-describedby={
                        fieldErrors.username
                          ? "login-username-error"
                          : undefined
                      }
                      onChange={() => clearFieldError("username")}
                      className="h-12 border-0 bg-[#F6F5F8] pl-10 text-sm shadow-none placeholder:text-muted-foreground focus-visible:bg-[#F6F5F8] focus-visible:ring-2 focus-visible:ring-[#6366f1] lg:h-16 lg:pl-12 lg:text-base"
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
                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground lg:left-3 lg:size-5"
                      aria-hidden
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Password"
                      aria-invalid={fieldErrors.password ? true : undefined}
                      aria-describedby={
                        fieldErrors.password
                          ? "login-password-error"
                          : undefined
                      }
                      onChange={() => clearFieldError("password")}
                      className="h-12 border-0 bg-[#F6F5F8] pr-10 pl-10 text-sm shadow-none placeholder:text-muted-foreground focus-visible:bg-[#F6F5F8] focus-visible:ring-2 focus-visible:ring-[#6366f1] lg:h-16 lg:pr-11 lg:pl-12 lg:text-base"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-200/80 hover:text-foreground lg:right-2.5 lg:size-8"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 lg:size-5" />
                      ) : (
                        <Eye className="size-4 lg:size-5" />
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

              <div className="flex justify-between gap-3">
                <div className="flex items-center gap-2 lg:gap-2.5">
                  <Checkbox id="remember" className="border-[#6366f1]" />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer text-xs font-normal text-muted-foreground lg:text-sm"
                  >
                    Remember for 30 days
                  </Label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-[#6366f1] hover:underline lg:text-sm"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                aria-busy={isLoggingIn}
                className="h-11 w-full rounded-lg bg-[#ff8c42] text-sm font-semibold text-white shadow-sm hover:bg-[#ff8c42]/92 disabled:opacity-90 lg:h-14 lg:text-base"
              >
                {isLoggingIn ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2
                      className="size-4 shrink-0 animate-spin lg:size-5"
                      aria-hidden
                    />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
