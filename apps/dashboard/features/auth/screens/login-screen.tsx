"use client"

import { useLoginController } from "../controller/use-login-controller"
import { LoginView } from "../view/login-view"

export function LoginScreen() {
  return <LoginView {...useLoginController()} />
}
