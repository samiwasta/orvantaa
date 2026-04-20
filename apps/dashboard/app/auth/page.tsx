import type { Metadata } from "next"

import { LoginScreen } from "./login-screen"

export const metadata: Metadata = {
  title: "Login - Orvantaa",
  description: "Login to your Orvantaa account",
}

export default function AuthPage() {
  return <LoginScreen />
}
