"use client"

import * as React from "react"

import { fieldErrorsFromZod, loginSchema } from "../model/schemas"

export type LoginFieldName = "username" | "password"

export function useLoginController() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoggingIn, setIsLoggingIn] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<LoginFieldName, string>>
  >({})

  const toggleShowPassword = React.useCallback(() => {
    setShowPassword((v) => !v)
  }, [])

  const clearFieldError = React.useCallback((field: LoginFieldName) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
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
      })

      if (!parsed.success) {
        setFieldErrors(
          fieldErrorsFromZod(parsed.error) as Partial<
            Record<LoginFieldName, string>
          >
        )
        return
      }

      setFieldErrors({})
      setIsLoggingIn(true)
      void (async () => {
        try {
          await new Promise((r) => setTimeout(r, 1500))
        } finally {
          setIsLoggingIn(false)
        }
      })()
    },
    [isLoggingIn]
  )

  return {
    showPassword,
    toggleShowPassword,
    fieldErrors,
    clearFieldError,
    onSubmit,
    isLoggingIn,
  }
}

export type LoginController = ReturnType<typeof useLoginController>
