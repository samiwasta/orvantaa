import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"
import {
  isSchoolSubscriptionAccessAllowed,
  type SchoolSubscriptionStatus,
} from "@/features/schools/model/school-subscription"
import { schoolSubscriptionService } from "@/features/schools/service/school-subscription.service"
import { SubscriptionUnavailableView } from "@/features/schools/view/subscription-unavailable-view"

export const metadata: Metadata = {
  title: "Access unavailable - Orvantaa",
  description: "Your school's platform access is currently unavailable.",
}

type PageProps = {
  searchParams: Promise<{
    status?: string
    school?: string
    message?: string
  }>
}

function parseStatus(value: string | undefined): SchoolSubscriptionStatus {
  if (
    value === "inactive" ||
    value === "hold" ||
    value === "blocked" ||
    value === "active" ||
    value === "unassigned"
  ) {
    return value
  }
  return "inactive"
}

async function SubscriptionUnavailableContent({
  searchParams,
}: {
  searchParams: PageProps["searchParams"]
}) {
  const params = await searchParams
  const session = await getAuthSession()

  if (session?.role === "student") {
    const access = await schoolSubscriptionService.getStudentSchoolAccess(
      session.sub
    )
    if (isSchoolSubscriptionAccessAllowed(access.status)) {
      redirect("/dashboard")
    }
  }

  return (
    <SubscriptionUnavailableView
      status={parseStatus(params.status)}
      schoolName={params.school?.trim() || null}
      message={params.message?.trim() || null}
    />
  )
}

export default function SubscriptionUnavailablePage({
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={null}>
      <SubscriptionUnavailableContent searchParams={searchParams} />
    </Suspense>
  )
}
