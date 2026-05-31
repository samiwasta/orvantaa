import type { Metadata } from "next"

import { loadClasses } from "@/features/classes/server/load-classes"
import { ClassesCardsView } from "@/features/classes/view/classes-cards-view"

export const metadata: Metadata = {
  title: "Classes - Orvantaa Admin",
  description: "View and manage classes and sections",
}

export default async function ClassesPage() {
  const { classes, schoolOptions } = await loadClasses()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ClassesCardsView classes={classes} schoolOptions={schoolOptions} />
    </div>
  )
}
