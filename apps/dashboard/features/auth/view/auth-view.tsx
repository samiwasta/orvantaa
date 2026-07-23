"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { BrandLogo } from "@/features/brand/view/brand-logo"

import { useLoginController } from "../controller/use-login-controller"
import { useRegisterController } from "../controller/use-register-controller"
import type { LoginMode } from "../model/schemas"
import { AuthPageShell } from "./auth-page-shell"

type AuthMode = "signin" | "signup"
type SignInKind = "individual" | "school"
type FormVariant = "desktop" | "sheet"

type AuthViewProps = {
  initialFormError?: string | null
}

const fieldInputClass =
  "h-11 rounded-xl border-0 bg-[#F3F4F8] pl-10 text-sm shadow-none placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#4169E1]/30"

const primaryButtonClass =
  "h-11 w-full rounded-xl bg-[#4169E1] text-sm font-semibold tracking-wide text-white uppercase hover:bg-[#3558C8] disabled:opacity-80"

const overlayButtonClass =
  "inline-flex h-11 min-w-[9.5rem] cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-transparent px-8 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:border-white hover:bg-white hover:text-[#4169E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"

const overlayTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
}

export function AuthView({ initialFormError }: AuthViewProps) {
  const [mode, setMode] = React.useState<AuthMode>("signin")
  const [signInKind, setSignInKind] = React.useState<SignInKind>("individual")

  const loginMode: LoginMode = signInKind === "school" ? "school" : "individual"
  const login = useLoginController(loginMode)
  const register = useRegisterController()

  const displayLoginError =
    mode === "signin" ? (login.formError ?? initialFormError ?? null) : null

  const clearLoginFormError = login.clearFormError

  React.useEffect(() => {
    clearLoginFormError()
  }, [mode, signInKind, clearLoginFormError])

  const isSignup = mode === "signup"
  const showBack = isSignup || signInKind === "school"

  const goSignIn = React.useCallback(() => {
    setMode("signin")
    setSignInKind("individual")
  }, [])

  const goSignUp = React.useCallback(() => {
    setMode("signup")
    setSignInKind("individual")
  }, [])

  const headerEyebrow =
    mode === "signup"
      ? "Join Orvantaa"
      : signInKind === "school"
        ? "School access"
        : "Welcome back"

  const headerTitle =
    mode === "signup"
      ? "Create your Account"
      : signInKind === "school"
        ? "Sign In with School"
        : "Sign In to your Account"

  return (
    <AuthPageShell className="items-stretch overflow-x-hidden p-0 md:items-center md:overflow-hidden md:px-6 md:py-10">
      {/* Mobile sheet layout */}
      <div className="relative flex h-dvh max-h-dvh flex-col overflow-x-hidden overflow-y-hidden bg-[#3558C8] md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#2F4FC4_0%,#4169E1_48%,#5B7FF0_100%)]"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-10 left-[-20%] size-56 rounded-full bg-[#7EA0FF]/35 blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-[18%] right-[-18%] size-48 rounded-full bg-[#FF9D57]/28 blur-3xl"
          animate={{ opacity: [0.25, 0.45, 0.25], y: [0, 14, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.header
          className={cn(
            "relative z-[1] flex shrink-0 flex-col justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))]",
            isSignup || signInKind === "school"
              ? "min-h-[34dvh] pb-12"
              : "h-[42dvh] pb-12"
          )}
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex items-center justify-between gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={() => {
                  if (signInKind === "school") {
                    setSignInKind("individual")
                    return
                  }
                  goSignIn()
                }}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                aria-label="Back"
              >
                <ArrowLeft className="size-5" aria-hidden />
              </button>
            ) : (
              <span className="size-10" aria-hidden />
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              className="rounded-2xl bg-white/95 px-3.5 py-2 shadow-[0_12px_30px_-14px_rgba(12,24,70,0.55)] ring-1 ring-white/70"
            >
              <BrandLogo size="sm" priority />
            </motion.div>
            <span className="size-10" aria-hidden />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={headerTitle}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative space-y-2.5"
            >
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-white/70 uppercase">
                {headerEyebrow}
              </p>
              <h1 className="max-w-[13ch] font-heading text-[2rem] leading-[1.1] font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(20,40,100,0.25)]">
                {headerTitle}
              </h1>
            </motion.div>
          </AnimatePresence>
        </motion.header>

        <motion.div
          className={cn(
            "relative z-10 -mt-5 flex min-h-0 flex-col overflow-hidden rounded-t-[2rem] bg-white px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-24px_60px_-20px_rgba(18,36,90,0.45)] ring-1 ring-black/5",
            isSignup || signInKind === "school"
              ? "flex-1"
              : "h-[62dvh] shrink-0"
          )}
          initial={{ y: "18%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 210,
            damping: 28,
            mass: 0.95,
            delay: 0.08,
          }}
        >
          <div
            aria-hidden
            className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#D8DEEA]"
          />

          <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-x-hidden overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isSignup ? (
                <motion.div
                  key="mobile-signup"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-full flex-col"
                >
                  <RegisterPanel {...register} variant="sheet" />
                  <p className="mt-auto pt-7 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={goSignIn}
                      className="font-semibold text-[#4169E1] transition hover:text-[#3558C8]"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`mobile-signin-${signInKind}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-full flex-col"
                >
                  <SignInPanel
                    login={login}
                    formError={displayLoginError}
                    signInKind={signInKind}
                    onSignInKindChange={setSignInKind}
                    variant="sheet"
                    onRequestSignUp={goSignUp}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Desktop sliding overlay */}
      <div className="mx-auto hidden w-full max-w-[54rem] md:block">
        <div className="relative min-h-[620px] overflow-hidden rounded-3xl border border-[#E4E9F5] bg-white shadow-[0_28px_70px_-32px_rgba(45,70,140,0.35)]">
          <div className="grid h-full min-h-[620px] grid-cols-2">
            <div
              className={cn(
                "flex flex-col justify-center px-8 py-10 transition-opacity duration-200 lg:px-12",
                isSignup && "pointer-events-none opacity-0"
              )}
              aria-hidden={isSignup}
            >
              <SignInPanel
                login={login}
                formError={displayLoginError}
                signInKind={signInKind}
                onSignInKindChange={setSignInKind}
                variant="desktop"
              />
            </div>
            <div
              className={cn(
                "flex max-h-[620px] flex-col justify-center overflow-y-auto px-8 py-10 transition-opacity duration-200 lg:px-12",
                !isSignup && "pointer-events-none opacity-0"
              )}
              aria-hidden={!isSignup}
            >
              <RegisterPanel {...register} variant="desktop" />
            </div>
          </div>

          <motion.div
            className="absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden bg-gradient-to-br from-[#3558C8] via-[#4169E1] to-[#6687F0] text-white"
            initial={false}
            animate={{ x: isSignup ? "0%" : "100%" }}
            transition={overlayTransition}
          >
            <OverlayDecor />
            <div className="relative flex h-full flex-col items-center justify-center px-8 text-center lg:px-12">
              <div className="mb-6 rounded-xl bg-white px-3.5 py-2 shadow-sm">
                <BrandLogo size="sm" priority />
              </div>
              <OverlayCopy
                isSignup={isSignup}
                onSignIn={goSignIn}
                onSignUp={goSignUp}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </AuthPageShell>
  )
}

function OverlayDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-[#FF9D57]/25 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-8 size-56 rounded-full bg-white/10 blur-2xl"
      />
    </>
  )
}

function OverlayCopy({
  isSignup,
  onSignIn,
  onSignUp,
}: {
  isSignup: boolean
  onSignIn: () => void
  onSignUp: () => void
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {isSignup ? (
        <motion.div
          key="overlay-signin"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Welcome back!
          </h2>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/90">
            Already have an account? Sign in and continue where you left off.
          </p>
          <button
            type="button"
            className={cn(overlayButtonClass, "mt-4")}
            onClick={onSignIn}
          >
            Sign in
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="overlay-signup"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Create your account!
          </h2>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/90">
            New here? Join Orvantaa and start learning with your own plan.
          </p>
          <button
            type="button"
            className={cn(overlayButtonClass, "mt-4")}
            onClick={onSignUp}
          >
            Sign up
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SignInPanel({
  login,
  formError,
  signInKind,
  onSignInKindChange,
  variant,
  onRequestSignUp,
}: {
  login: ReturnType<typeof useLoginController>
  formError: string | null
  signInKind: SignInKind
  onSignInKindChange: (kind: SignInKind) => void
  variant: FormVariant
  onRequestSignUp?: () => void
}) {
  const isSheet = variant === "sheet"

  if (signInKind === "school") {
    return (
      <div
        className={cn(
          "w-full",
          isSheet ? "space-y-5" : "mx-auto max-w-sm space-y-5"
        )}
      >
        {!isSheet ? (
          <button
            type="button"
            onClick={() => onSignInKindChange("individual")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </button>
        ) : null}
        {!isSheet ? (
          <div className="space-y-1 text-center">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
              School sign in
            </h1>
            <p className="text-sm text-slate-500">
              Use the username or email and password your school sent you.
            </p>
          </div>
        ) : null}
        <LoginForm
          {...login}
          formError={formError}
          usernameLabel="Username or email"
          usernamePlaceholder="Username or email"
          usernameAutoComplete="username"
          variant={variant}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-full",
        isSheet ? "flex flex-1 flex-col gap-5" : "mx-auto max-w-sm space-y-5"
      )}
    >
      {!isSheet ? (
        <div className="space-y-1 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to access your account and continue learning.
          </p>
        </div>
      ) : null}

      <LoginForm
        {...login}
        formError={formError}
        usernameLabel="Email"
        usernamePlaceholder="Email"
        usernameAutoComplete="email"
        variant={variant}
      />

      {isSheet ? (
        <>
          {onRequestSignUp ? (
            <p className="pt-1 text-center text-sm text-slate-500">
              New here?{" "}
              <button
                type="button"
                onClick={onRequestSignUp}
                className="font-semibold text-[#4169E1] transition hover:text-[#3558C8]"
              >
                Create an account
              </button>
            </p>
          ) : null}

          <div className="flex flex-col gap-4 pt-4">
            <div className="h-px w-full bg-[#EBEEF5]" aria-hidden />

            <div className="space-y-3 rounded-2xl border border-[#E8ECF6] bg-[#F7F9FD] p-4">
              <p className="text-center text-sm leading-relaxed text-slate-500">
                Log in via your school&apos;s subscription.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => onSignInKindChange("school")}
                className="h-11 w-full rounded-xl border-[#4169E1]/40 bg-white text-sm font-semibold text-[#4169E1] shadow-[0_8px_20px_-14px_rgba(65,105,225,0.55)] hover:border-[#4169E1] hover:bg-white"
              >
                <Building2 className="size-4" aria-hidden />
                Continue with Your School Plan
              </Button>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onSignInKindChange("school")}
          className="flex w-full items-center gap-3 rounded-2xl border border-[#E2E8F5] bg-[#F7F9FD] p-3 text-left transition hover:border-[#4169E1]/35 hover:bg-white"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#4169E1] text-white">
            <Building2 className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900">
              Login via school plan
            </span>
            <span className="block text-xs text-slate-500">
              Use credentials from your school.
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

function RegisterPanel({
  showPassword,
  toggleShowPassword,
  fieldErrors,
  formError,
  clearFieldError,
  onSubmit,
  isRegistering,
  variant,
}: ReturnType<typeof useRegisterController> & { variant: FormVariant }) {
  const isSheet = variant === "sheet"
  const inputClass = fieldInputClass

  return (
    <div
      className={cn(
        "w-full",
        isSheet ? "space-y-5" : "mx-auto max-w-sm space-y-5"
      )}
    >
      {!isSheet ? (
        <div className="space-y-1 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
            Create account
          </h1>
          <p className="text-sm text-slate-500">
            For students buying their own plan. Schools create accounts
            separately.
          </p>
        </div>
      ) : null}

      <form className="space-y-3.5" noValidate onSubmit={onSubmit}>
        {formError ? (
          <p
            className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        <Field
          id="fullName"
          label="Full name"
          error={fieldErrors.fullName}
          icon={<UserRound className="size-4" aria-hidden />}
        >
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Full name"
            aria-invalid={fieldErrors.fullName ? true : undefined}
            onChange={() => clearFieldError("fullName")}
            className={inputClass}
          />
        </Field>

        <Field
          id="email"
          label="Email"
          error={fieldErrors.email}
          icon={<Mail className="size-4" aria-hidden />}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            aria-invalid={fieldErrors.email ? true : undefined}
            onChange={() => clearFieldError("email")}
            className={inputClass}
          />
        </Field>

        <Field
          id="phone"
          label="Phone number"
          error={fieldErrors.phone}
          icon={<Phone className="size-4" aria-hidden />}
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Phone number"
            aria-invalid={fieldErrors.phone ? true : undefined}
            onChange={() => clearFieldError("phone")}
            className={inputClass}
          />
        </Field>

        <Field
          id="dateOfBirth"
          label="Date of birth"
          error={fieldErrors.dateOfBirth}
          icon={<CalendarDays className="size-4" aria-hidden />}
        >
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            autoComplete="bday"
            aria-invalid={fieldErrors.dateOfBirth ? true : undefined}
            onChange={() => clearFieldError("dateOfBirth")}
            className={cn(inputClass, "appearance-none")}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          error={fieldErrors.password}
          icon={<LockKeyhole className="size-4" aria-hidden />}
        >
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
            aria-invalid={fieldErrors.password ? true : undefined}
            onChange={() => clearFieldError("password")}
            className={cn(inputClass, "pr-10")}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#4169E1] hover:text-[#3558C8]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </Field>

        <Button
          type="submit"
          disabled={isRegistering}
          aria-busy={isRegistering}
          className={cn(primaryButtonClass, "mt-1")}
        >
          {isRegistering ? (
            <span className="inline-flex items-center gap-2 normal-case">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Creating account...
            </span>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>
    </div>
  )
}

function LoginForm({
  showPassword,
  toggleShowPassword,
  rememberMe,
  setRememberMe,
  fieldErrors,
  formError,
  clearFieldError,
  onSubmit,
  isLoggingIn,
  usernameLabel,
  usernamePlaceholder,
  usernameAutoComplete,
  variant,
}: ReturnType<typeof useLoginController> & {
  formError: string | null
  usernameLabel: string
  usernamePlaceholder: string
  usernameAutoComplete: string
  variant: FormVariant
}) {
  const isSheet = variant === "sheet"

  return (
    <form className="space-y-4" noValidate onSubmit={onSubmit}>
      {formError ? (
        <p
          className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <motion.div
        initial={isSheet ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.28 }}
      >
        <Field
          id="auth-username"
          label={usernameLabel}
          error={fieldErrors.username}
          icon={<UserRound className="size-4" aria-hidden />}
        >
          <Input
            id="auth-username"
            name="username"
            autoComplete={usernameAutoComplete}
            placeholder={usernamePlaceholder}
            aria-invalid={fieldErrors.username ? true : undefined}
            onChange={() => clearFieldError("username")}
            className={fieldInputClass}
          />
        </Field>
      </motion.div>

      <motion.div
        initial={isSheet ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <Field
          id="auth-password"
          label="Password"
          error={fieldErrors.password}
          icon={<LockKeyhole className="size-4" aria-hidden />}
        >
          <Input
            id="auth-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Password"
            aria-invalid={fieldErrors.password ? true : undefined}
            onChange={() => clearFieldError("password")}
            className={cn(fieldInputClass, "pr-10")}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#4169E1] hover:text-[#3558C8]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </Field>
      </motion.div>

      <motion.div
        initial={isSheet ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
        className="flex items-center justify-between gap-3"
      >
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="border-slate-300 data-[state=checked]:border-[#4169E1] data-[state=checked]:bg-[#4169E1]"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#4169E1] transition hover:text-[#3558C8]"
        >
          Forgot Password ?
        </Link>
      </motion.div>

      <motion.div
        initial={isSheet ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <Button
          type="submit"
          disabled={isLoggingIn}
          aria-busy={isLoggingIn}
          className={primaryButtonClass}
        >
          {isLoggingIn ? (
            <span className="inline-flex items-center gap-2 normal-case">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </motion.div>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  icon,
  children,
}: {
  id: string
  label: string
  error?: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        {children}
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
