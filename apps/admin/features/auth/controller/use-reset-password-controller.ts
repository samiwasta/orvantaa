"use client"

import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import {
  clearResetPasswordSuccess,
  markResetPasswordSuccess,
} from "../model/reset-password-session"
import { fieldErrorsFromZod, resetPasswordSchema } from "../model/schemas"

export type ResetPasswordFieldName = "newPassword" | "confirmNewPassword"

export function useResetPasswordController() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() ?? ""

  const [isResettingPassword, setIsResettingPassword] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<ResetPasswordFieldName, string>>
  >({})
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    clearResetPasswordSuccess()
    if (!token) {
      setFormError("This reset link is invalid or has expired.")
    }
  }, [token])

  const toggleShowPassword = React.useCallback(() => {
    setShowPassword((v) => !v)
  }, [])

  const toggleShowConfirmPassword = React.useCallback(() => {
    setShowConfirmPassword((v) => !v)
  }, [])

  const clearFieldError = React.useCallback((field: ResetPasswordFieldName) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isResettingPassword || !token) return

      const form = e.currentTarget
      const fd = new FormData(form)
      const parsed = resetPasswordSchema.safeParse({
        newPassword: fd.get("newPassword"),
        confirmNewPassword: fd.get("confirmNewPassword"),
      })

      if (!parsed.success) {
        setFieldErrors(
          fieldErrorsFromZod(parsed.error) as Partial<
            Record<ResetPasswordFieldName, string>
          >
        )
        return
      }

      setFieldErrors({})
      setFormError(null)
      setIsResettingPassword(true)
      void (async () => {
        try {
          const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              newPassword: parsed.data.newPassword,
            }),
          })

          const payload = (await response.json()) as { message?: string }

          if (!response.ok) {
            setFormError(
              payload.message ??
                "Could not reset your password. Please try again."
            )
            return
          }

          markResetPasswordSuccess()
          router.push("/auth?passwordUpdated=1")
        } catch {
          setFormError("Could not reset your password. Please try again.")
        } finally {
          setIsResettingPassword(false)
        }
      })()
    },
    [isResettingPassword, router, token]
  )

  return {
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    fieldErrors,
    formError,
    clearFieldError,
    onSubmit,
    isResettingPassword,
    canSubmit: Boolean(token),
  }
}

export type ResetPasswordController = ReturnType<
  typeof useResetPasswordController
>
