"use client"

import { Suspense } from "react"

import { useResetPasswordController } from "../controller/use-reset-password-controller"
import { ResetPasswordView } from "../view/reset-password-view"

function ResetPasswordScreenInner() {
  return <ResetPasswordView {...useResetPasswordController()} />
}

export function ResetPasswordScreen() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordScreenInner />
    </Suspense>
  )
}
