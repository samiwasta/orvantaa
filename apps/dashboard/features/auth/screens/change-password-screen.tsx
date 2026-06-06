"use client"

import { Suspense } from "react"

import { useChangePasswordController } from "../controller/use-change-password-controller"
import { ResetPasswordView } from "../view/reset-password-view"

function ChangePasswordScreenInner() {
  return <ResetPasswordView {...useChangePasswordController()} />
}

export function ChangePasswordScreen() {
  return (
    <Suspense fallback={null}>
      <ChangePasswordScreenInner />
    </Suspense>
  )
}
