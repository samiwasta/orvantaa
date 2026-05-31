import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginScreen } from "@/features/auth/screens/login-screen"

export const metadata: Metadata = {
  title: "Login - Orvantaa",
  description: "Login to your Orvantaa account",
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  )
}
