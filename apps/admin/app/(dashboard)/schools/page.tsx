import type { Metadata } from "next"

import { AdminSectionPlaceholder } from "@/features/admin/view/admin-section-placeholder"

export const metadata: Metadata = {
  title: "Schools - Orvantaa Admin",
  description: "Manage schools",
}

export default function SchoolsPage() {
  return (
    <AdminSectionPlaceholder
      title="Schools"
      description="Add schools, link them to boards, and organize classes under each school."
    />
  )
}
