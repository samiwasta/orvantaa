import type { Metadata } from "next"

import { ForgotPasswordSentScreen } from "@/features/auth/screens/forgot-password-sent-screen"

export const metadata: Metadata = {
  title: "Check your email - Orvantaa",
  description: "Password reset link sent",
}

export default function ForgotPasswordSentPage() {
  return <ForgotPasswordSentScreen />
}
