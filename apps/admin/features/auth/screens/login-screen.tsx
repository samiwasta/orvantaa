"use client"

import { useSearchParams } from "next/navigation"
import * as React from "react"

import { useLoginController } from "../controller/use-login-controller"
import { LoginView } from "../view/login-view"

export function LoginScreen() {
  const searchParams = useSearchParams()
  const controller = useLoginController()
  const forbiddenMessage = React.useMemo(() => {
    if (searchParams.get("reason") !== "forbidden") return null
    return "This account cannot access the admin portal. Sign in with an admin account."
  }, [searchParams])

  return <LoginView {...controller} initialFormError={forbiddenMessage} />
}
