import type { Metadata } from "next"

import { ForgotPasswordScreen } from "@/features/auth/screens/forgot-password-screen"

export const metadata: Metadata = {
  title: "Forgot Password - Orvantaa",
  description: "Forgot your Orvantaa password?",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />
}
