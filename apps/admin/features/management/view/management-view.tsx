"use client"

import { useSearchParams } from "next/navigation"

import {
  pageContainerClass,
  pageHeaderDescriptionClass,
  pageHeaderTitleClass,
  pageSectionBodyClass,
  pageSectionClass,
} from "@/features/shared/view/page-layout"
import { ScrollableTabs } from "@/features/shared/view/scrollable-tabs"
import type {
  IntegrationStatus,
  PlatformSettingsData,
} from "@/features/settings/model/platform-settings"
import type { TeamMember } from "@/features/team/model/team-member"

import { ManagementTeamTab } from "./management-team-tab"
import { SubscriptionSettingsTab } from "./subscription-settings-tab"

type ManagementTabId = "team" | "subscription-settings"

const MANAGEMENT_TABS: Array<{
  id: ManagementTabId
  label: string
  mobileLabel?: string
}> = [
  { id: "team", label: "Team" },
  { id: "subscription-settings", label: "Subscription Settings", mobileLabel: "Billing" },
]

function tabHref(tab: ManagementTabId): string {
  return tab === "team" ? "/management" : `/management?tab=${tab}`
}

type ManagementViewProps = {
  members: TeamMember[]
  currentAdminId: string
  currentUserIsSuperAdmin: boolean
  settings: PlatformSettingsData
  integrationStatus: IntegrationStatus
  initialTab: ManagementTabId
}

export function ManagementView({
  members,
  currentAdminId,
  currentUserIsSuperAdmin,
  settings,
  integrationStatus,
  initialTab,
}: ManagementViewProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const tab: ManagementTabId =
    tabParam === "subscription-settings" ? "subscription-settings" : initialTab

  const tabItems = MANAGEMENT_TABS.map(({ id, label, mobileLabel }) => ({
    id,
    label,
    mobileLabel,
    href: tabHref(id),
  }))

  return (
    <div className={pageContainerClass}>
      <div className="min-w-0">
        <h1 className={pageHeaderTitleClass}>Management</h1>
        <p className={pageHeaderDescriptionClass}>
          Admin team access and platform subscription billing.
        </p>
      </div>

      <div className={pageSectionClass}>
        <div className="border-b border-border/60 bg-muted/20">
          <ScrollableTabs
            items={tabItems}
            activeId={tab}
            ariaLabel="Management sections"
          />
        </div>

        <div className={pageSectionBodyClass}>
          {tab === "team" ? (
            <ManagementTeamTab
              members={members}
              currentAdminId={currentAdminId}
              currentUserIsSuperAdmin={currentUserIsSuperAdmin}
            />
          ) : null}
          {tab === "subscription-settings" ? (
            <SubscriptionSettingsTab
              initialSettings={settings}
              integrationStatus={integrationStatus}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
