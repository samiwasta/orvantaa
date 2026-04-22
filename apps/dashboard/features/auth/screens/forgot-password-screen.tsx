"use client"

import { useForgotPasswordController } from "../controller/use-forgot-password-controller"
import { ForgotPasswordView } from "../view/forgot-password-view"

export function ForgotPasswordScreen() {
  return <ForgotPasswordView {...useForgotPasswordController()} />
}
