import type { Metadata } from "next"

import { loadContentSchools } from "@/features/content/server/load-content-schools"
import { ContentSchoolsView } from "@/features/content/view/content-schools-view"

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
  description: "Manage subjects, chapters, notes, and quizzes",
}

export default async function ContentPage() {
  const { schools } = await loadContentSchools()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentSchoolsView schools={schools} />
    </div>
  )
}
