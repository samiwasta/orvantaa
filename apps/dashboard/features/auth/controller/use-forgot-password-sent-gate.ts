"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { hasForgotPasswordLinkSent } from "../model/forgot-password-session"

export function useForgotPasswordSentGate() {
  const router = useRouter()
  const [allowed, setAllowed] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (hasForgotPasswordLinkSent()) {
      setAllowed(true)
      return
    }
    router.replace("/forgot-password")
  }, [router])

  return { allowed }
}
