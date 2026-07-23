"use client"

import { useResetPasswordSuccessGate } from "../controller/use-reset-password-success-gate"
import { AuthGateLoading } from "../view/auth-page-shell"
import { ResetPasswordSuccessView } from "../view/reset-password-success-view"

export function ResetPasswordSuccessScreen() {
  const { allowed } = useResetPasswordSuccessGate()

  if (allowed !== true) {
    return <AuthGateLoading />
  }

  return <ResetPasswordSuccessView />
}
