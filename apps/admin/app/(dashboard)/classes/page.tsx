import type { Metadata } from "next"

import { AdminSectionPlaceholder } from "@/features/admin/view/admin-section-placeholder"

export const metadata: Metadata = {
  title: "Classes - Orvantaa Admin",
  description: "Manage classes and sections",
}

export default function ClassesPage() {
  return (
    <AdminSectionPlaceholder
      title="Classes"
      description="Define classes and sections per school, assign students, and attach subjects."
    />
  )
}
