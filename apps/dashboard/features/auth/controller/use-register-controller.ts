"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { fieldErrorsFromZod, registerSchema } from "../model/schemas"

export type RegisterFieldName =
  | "fullName"
  | "email"
  | "phone"
  | "dateOfBirth"
  | "password"

export function useRegisterController() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isRegistering, setIsRegistering] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<RegisterFieldName, string>>
  >({})

  const toggleShowPassword = React.useCallback(() => {
    setShowPassword((v) => !v)
  }, [])

  const clearFieldError = React.useCallback((field: RegisterFieldName) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(null)
  }, [])

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isRegistering) return

      const form = e.currentTarget
      const fd = new FormData(form)
      const parsed = registerSchema.safeParse({
        fullName: fd.get("fullName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        dateOfBirth: fd.get("dateOfBirth"),
        password: fd.get("password"),
      })

      if (!parsed.success) {
        setFormError(null)
        setFieldErrors(
          fieldErrorsFromZod(parsed.error) as Partial<
            Record<RegisterFieldName, string>
          >
        )
        return
      }

      setFieldErrors({})
      setFormError(null)
      setIsRegistering(true)

      void (async () => {
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          })

          const data = (await response.json()) as {
            message?: string
            fieldErrors?: Partial<Record<RegisterFieldName, string>>
          }

          if (!response.ok) {
            if (
              (response.status === 422 || response.status === 409) &&
              data.fieldErrors
            ) {
              setFieldErrors(data.fieldErrors)
              if (data.message && !data.fieldErrors.email) {
                setFormError(data.message)
              }
              return
            }
            setFormError(
              data.message ?? "Registration failed. Please try again."
            )
            return
          }

          router.push("/onboarding")
          router.refresh()
        } catch {
          setFormError("Unable to reach the server. Please try again.")
        } finally {
          setIsRegistering(false)
        }
      })()
    },
    [isRegistering, router]
  )

  return {
    showPassword,
    toggleShowPassword,
    fieldErrors,
    formError,
    clearFieldError,
    onSubmit,
    isRegistering,
  }
}

export type RegisterController = ReturnType<typeof useRegisterController>
