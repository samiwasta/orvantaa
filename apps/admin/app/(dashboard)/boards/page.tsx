import type { Metadata } from "next"

import { AdminSectionPlaceholder } from "@/features/admin/view/admin-section-placeholder"

export const metadata: Metadata = {
  title: "Boards - Orvantaa Admin",
  description: "Manage boards and universities",
}

export default function BoardsPage() {
  return (
    <AdminSectionPlaceholder
      title="Boards"
      description="Configure education boards and universities such as CBSE, ICSE, and state boards."
    />
  )
}
