import type { Metadata } from "next"

import { ResetPasswordSuccessScreen } from "@/features/auth/screens/reset-password-success-screen"

export const metadata: Metadata = {
  title: "Password updated - Orvantaa Admin",
  description: "Your password was changed successfully",
}

export default function ResetPasswordSuccessPage() {
  return <ResetPasswordSuccessScreen />
}
