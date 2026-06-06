"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { fieldErrorsFromZod, resetPasswordSchema } from "../model/schemas"

export type ChangePasswordFieldName = "newPassword" | "confirmNewPassword"

export function useChangePasswordController() {
  const router = useRouter()

  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<ChangePasswordFieldName, string>>
  >({})
  const [formError, setFormError] = React.useState<string | null>(null)

  const toggleShowPassword = React.useCallback(() => {
    setShowPassword((value) => !value)
  }, [])

  const toggleShowConfirmPassword = React.useCallback(() => {
    setShowConfirmPassword((value) => !value)
  }, [])

  const clearFieldError = React.useCallback(
    (field: ChangePasswordFieldName) => {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    []
  )

  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isChangingPassword) return

      const form = event.currentTarget
      const formData = new FormData(form)
      const parsed = resetPasswordSchema.safeParse({
        newPassword: formData.get("newPassword"),
        confirmNewPassword: formData.get("confirmNewPassword"),
      })

      if (!parsed.success) {
        setFieldErrors(
          fieldErrorsFromZod(parsed.error) as Partial<
            Record<ChangePasswordFieldName, string>
          >
        )
        return
      }

      setFieldErrors({})
      setFormError(null)
      setIsChangingPassword(true)

      void (async () => {
        try {
          const response = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword: parsed.data.newPassword }),
          })

          const payload = (await response.json()) as {
            message?: string
            fieldErrors?: Record<string, string[]>
          }

          if (!response.ok) {
            if (response.status === 422 && payload.fieldErrors) {
              const flat: Partial<Record<ChangePasswordFieldName, string>> = {}
              for (const [key, messages] of Object.entries(
                payload.fieldErrors
              )) {
                if (
                  messages[0] &&
                  (key === "newPassword" || key === "confirmNewPassword")
                ) {
                  flat[key] = messages[0]
                }
              }
              setFieldErrors(flat)
              return
            }
            setFormError(
              payload.message ??
                "Could not update your password. Please try again."
            )
            return
          }

          router.push("/auth")
          router.refresh()
        } catch {
          setFormError("Could not update your password. Please try again.")
        } finally {
          setIsChangingPassword(false)
        }
      })()
    },
    [isChangingPassword, router]
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
    isResettingPassword: isChangingPassword,
    canSubmit: true,
    title: "Choose your password",
    description:
      "Your school sent temporary login details by email. Set a new password before continuing.",
    submitLabel: "Save password",
    pendingLabel: "Saving password...",
  }
}
