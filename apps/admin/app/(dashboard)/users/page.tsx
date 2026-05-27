import type { Metadata } from "next"

import { AdminSectionPlaceholder } from "@/features/admin/view/admin-section-placeholder"

export const metadata: Metadata = {
  title: "Users - Orvantaa Admin",
  description: "Manage students and administrators",
}

export default function UsersPage() {
  return (
    <AdminSectionPlaceholder
      title="Users"
      description="Create and manage student and admin accounts, assign roles, and link users to classes."
    />
  )
}
