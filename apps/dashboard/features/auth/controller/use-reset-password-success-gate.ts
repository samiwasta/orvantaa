"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { hasResetPasswordSuccess } from "../model/reset-password-session"

export function useResetPasswordSuccessGate() {
  const router = useRouter()
  const [allowed, setAllowed] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (hasResetPasswordSuccess()) {
      setAllowed(true)
      return
    }
    router.replace("/reset-password")
  }, [router])

  return { allowed }
}
