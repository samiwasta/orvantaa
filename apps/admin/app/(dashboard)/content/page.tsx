import type { Metadata } from "next"

import { AdminSectionPlaceholder } from "@/features/admin/view/admin-section-placeholder"

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
  description: "Manage subjects, chapters, notes, and quizzes",
}

export default function ContentPage() {
  return (
    <AdminSectionPlaceholder
      title="Content"
      description="Manage subjects, chapters, notes, and quizzes for each class. This replaces the student learning view with a content management workflow."
    />
  )
}
