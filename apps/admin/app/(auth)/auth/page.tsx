import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginScreen } from "@/features/auth/screens/login-screen"

export const metadata: Metadata = {
  title: "Admin sign in - Orvantaa",
  description: "Sign in to the Orvantaa admin portal",
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  )
}
