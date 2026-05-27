import type { Metadata } from "next"

import { LoginScreen } from "@/features/auth/screens/login-screen"

export const metadata: Metadata = {
  title: "Admin sign in - Orvantaa",
  description: "Sign in to the Orvantaa admin portal",
}

export default function AuthPage() {
  return <LoginScreen />
}
