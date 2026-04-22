"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import {
  clearForgotPasswordLinkSent,
  markForgotPasswordLinkSent,
} from "../model/forgot-password-session"
import { fieldErrorsFromZod, forgotPasswordSchema } from "../model/schemas"

export function useForgotPasswordController() {
  const router = useRouter()
  const [isSendingResetLink, setIsSendingResetLink] = React.useState(false)
  const [emailError, setEmailError] = React.useState<string | undefined>()

  React.useEffect(() => {
    clearForgotPasswordLinkSent()
  }, [])

  const clearEmailError = React.useCallback(() => {
    setEmailError(undefined)
  }, [])

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isSendingResetLink) return

      const form = e.currentTarget
      const fd = new FormData(form)
      const parsed = forgotPasswordSchema.safeParse({
        email: fd.get("email"),
      })

      if (!parsed.success) {
        setEmailError(fieldErrorsFromZod(parsed.error).email)
        return
      }

      setEmailError(undefined)
      setIsSendingResetLink(true)
      void (async () => {
        try {
          await new Promise((r) => setTimeout(r, 1500))
          markForgotPasswordLinkSent()
          router.push("/forgot-password/sent")
        } finally {
          setIsSendingResetLink(false)
        }
      })()
    },
    [isSendingResetLink, router]
  )

  return {
    emailError,
    clearEmailError,
    onSubmit,
    isSendingResetLink,
  }
}

export type ForgotPasswordController = ReturnType<
  typeof useForgotPasswordController
>
