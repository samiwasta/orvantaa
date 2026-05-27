import type { Metadata } from "next"

import { AdminSectionPlaceholder } from "@/features/admin/view/admin-section-placeholder"

export const metadata: Metadata = {
  title: "Settings - Orvantaa Admin",
  description: "Admin portal settings",
}

export default function SettingsPage() {
  return (
    <AdminSectionPlaceholder
      title="Settings"
      description="Configure organization preferences, email delivery, and other platform options."
    />
  )
}
