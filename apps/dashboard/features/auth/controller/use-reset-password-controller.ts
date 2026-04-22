"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import {
  clearResetPasswordSuccess,
  markResetPasswordSuccess,
} from "../model/reset-password-session"
import { fieldErrorsFromZod, resetPasswordSchema } from "../model/schemas"

export type ResetPasswordFieldName = "newPassword" | "confirmNewPassword"

export function useResetPasswordController() {
  const router = useRouter()
  const [isResettingPassword, setIsResettingPassword] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<ResetPasswordFieldName, string>>
  >({})

  React.useEffect(() => {
    clearResetPasswordSuccess()
  }, [])

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
      if (isResettingPassword) return

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
      setIsResettingPassword(true)
      void (async () => {
        try {
          await new Promise((r) => setTimeout(r, 1500))
          markResetPasswordSuccess()
          router.push("/reset-password/success")
        } finally {
          setIsResettingPassword(false)
        }
      })()
    },
    [isResettingPassword, router]
  )

  return {
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    fieldErrors,
    clearFieldError,
    onSubmit,
    isResettingPassword,
  }
}

export type ResetPasswordController = ReturnType<
  typeof useResetPasswordController
>
