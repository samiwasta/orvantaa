"use client"

import { useSearchParams } from "next/navigation"
import * as React from "react"

import { AuthGateLoading } from "../view/auth-page-shell"
import { AuthView } from "../view/auth-view"

export function LoginScreen() {
  const searchParams = useSearchParams()
  const forbiddenMessage = React.useMemo(() => {
    if (searchParams.get("reason") !== "forbidden") return null
    return "This account cannot access the student app. Use the admin portal instead."
  }, [searchParams])

  return <AuthView initialFormError={forbiddenMessage} />
}

export function LoginScreenFallback() {
  return <AuthGateLoading />
}
