import type { Metadata } from "next"

import { ResetPasswordScreen } from "@/features/auth/screens/reset-password-screen"

export const metadata: Metadata = {
  title: "Reset Password - Orvantaa",
  description: "Reset your Orvantaa password",
}

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />
}
