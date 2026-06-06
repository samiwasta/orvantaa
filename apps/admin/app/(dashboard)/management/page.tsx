import type { Metadata } from "next"
import { Suspense } from "react"

import {
  loadManagementPage,
  type ManagementTabId,
} from "@/features/management/server/load-management-page"
import { ManagementView } from "@/features/management/view/management-view"

export const metadata: Metadata = {
  title: "Management - Orvantaa Admin",
  description: "Admin team and subscription settings",
}

type ManagementPageProps = {
  searchParams: Promise<{ tab?: string }>
}

function parseTab(value: string | undefined): ManagementTabId {
  return value === "subscription-settings" ? "subscription-settings" : "team"
}

async function ManagementPageContent({
  searchParams,
}: {
  searchParams: ManagementPageProps["searchParams"]
}) {
  const params = await searchParams
  const data = await loadManagementPage()

  return (
    <ManagementView
      members={data.members}
      currentAdminId={data.currentAdminId}
      currentUserIsSuperAdmin={data.currentUserIsSuperAdmin}
      settings={data.settings}
      integrationStatus={data.integrationStatus}
      initialTab={parseTab(params.tab)}
    />
  )
}

export default function ManagementPage({ searchParams }: ManagementPageProps) {
  return (
    <Suspense fallback={null}>
      <ManagementPageContent searchParams={searchParams} />
    </Suspense>
  )
}
