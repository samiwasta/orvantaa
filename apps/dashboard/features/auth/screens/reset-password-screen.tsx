"use client"

import { useResetPasswordController } from "../controller/use-reset-password-controller"
import { ResetPasswordView } from "../view/reset-password-view"

export function ResetPasswordScreen() {
  return <ResetPasswordView {...useResetPasswordController()} />
}
