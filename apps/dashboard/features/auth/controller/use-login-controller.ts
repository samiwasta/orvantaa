"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import {
  fieldErrorsFromZod,
  type LoginMode,
  loginSchema,
} from "../model/schemas"

export type LoginFieldName = "username" | "password"

export function useLoginController(loginMode: LoginMode) {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)
  const [isLoggingIn, setIsLoggingIn] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<LoginFieldName, string>>
  >({})

  const toggleShowPassword = React.useCallback(() => {
    setShowPassword((v) => !v)
  }, [])

  const clearFieldError = React.useCallback((field: LoginFieldName) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(null)
  }, [])

  const clearFormError = React.useCallback(() => {
    setFormError(null)
  }, [])

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isLoggingIn) return

      const form = e.currentTarget
      const fd = new FormData(form)
      const parsed = loginSchema.safeParse({
        username: fd.get("username"),
        password: fd.get("password"),
        loginMode,
      })

      if (!parsed.success) {
        setFormError(null)
        setFieldErrors(
          fieldErrorsFromZod(parsed.error) as Partial<
            Record<LoginFieldName, string>
          >
        )
        return
      }

      setFieldErrors({})
      setFormError(null)
      setIsLoggingIn(true)

      void (async () => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: parsed.data.username,
              password: parsed.data.password,
              loginMode: parsed.data.loginMode,
              rememberMe,
            }),
          })

          const data = (await response.json()) as {
            message?: string
            fieldErrors?: Record<string, string[]>
            mustChangePassword?: boolean
            needsOnboarding?: boolean
          }

          if (!response.ok) {
            if (response.status === 422 && data.fieldErrors) {
              const flat: Partial<Record<LoginFieldName, string>> = {}
              for (const [key, messages] of Object.entries(data.fieldErrors)) {
                if (messages[0] && (key === "username" || key === "password")) {
                  flat[key] = messages[0]
                }
              }
              setFieldErrors(flat)
              return
            }
            setFormError(data.message ?? "Login failed. Please try again.")
            return
          }

          router.push(
            data.mustChangePassword
              ? "/auth/change-password"
              : data.needsOnboarding
                ? "/onboarding"
                : "/dashboard"
          )
          router.refresh()
        } catch {
          setFormError("Unable to reach the server. Please try again.")
        } finally {
          setIsLoggingIn(false)
        }
      })()
    },
    [isLoggingIn, loginMode, rememberMe, router]
  )

  return {
    showPassword,
    toggleShowPassword,
    rememberMe,
    setRememberMe,
    fieldErrors,
    formError,
    clearFieldError,
    clearFormError,
    onSubmit,
    isLoggingIn,
  }
}

export type LoginController = ReturnType<typeof useLoginController>
