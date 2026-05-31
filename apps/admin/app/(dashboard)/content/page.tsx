import type { Metadata } from "next"

import { loadContentClasses } from "@/features/content/server/load-content-classes"
import { ContentClassesCardsView } from "@/features/content/view/content-classes-cards-view"

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
  description: "Manage subjects, chapters, notes, and quizzes",
}

export default async function ContentPage() {
  const { classes } = await loadContentClasses()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentClassesCardsView classes={classes} />
    </div>
  )
}
