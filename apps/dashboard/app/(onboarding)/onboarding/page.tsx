import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { OnboardingScreen } from "@/features/onboarding/screens/onboarding-screen"
import { onboardingService } from "@/features/onboarding/service/onboarding.service"
import { isOnboardingProtected } from "@/lib/auth/constants"
import { getAuthSession } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Onboarding - Orvantaa",
  description: "Tell us about your school to finish setting up Orvantaa",
}

export default async function OnboardingPage() {
  const session = await getAuthSession()
  if (session?.role !== "student") {
    redirect("/auth")
  }

  if (isOnboardingProtected()) {
    const complete = await onboardingService.isOnboardingComplete(session.sub)
    if (complete) {
      redirect("/dashboard")
    }
  }

  return <OnboardingScreen />
}
