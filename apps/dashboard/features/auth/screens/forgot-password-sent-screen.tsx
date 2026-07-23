"use client"

import { useForgotPasswordSentGate } from "../controller/use-forgot-password-sent-gate"
import { AuthGateLoading } from "../view/auth-page-shell"
import { ForgotPasswordSentView } from "../view/forgot-password-sent-view"

export function ForgotPasswordSentScreen() {
  const { allowed } = useForgotPasswordSentGate()

  if (allowed !== true) {
    return <AuthGateLoading />
  }

  return <ForgotPasswordSentView />
}
