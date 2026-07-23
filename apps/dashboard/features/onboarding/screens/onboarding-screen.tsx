"use client"

import { useOnboardingController } from "../controller/use-onboarding-controller"
import { OnboardingView } from "../view/onboarding-view"

export function OnboardingScreen() {
  return <OnboardingView {...useOnboardingController()} />
}
