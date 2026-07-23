import type { Metadata } from "next"
import { Suspense } from "react"

import {
  LoginScreen,
  LoginScreenFallback,
} from "@/features/auth/screens/login-screen"

export const metadata: Metadata = {
  title: "Sign in - Orvantaa",
  description: "Sign in or create your Orvantaa student account",
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoginScreenFallback />}>
      <LoginScreen />
    </Suspense>
  )
}
