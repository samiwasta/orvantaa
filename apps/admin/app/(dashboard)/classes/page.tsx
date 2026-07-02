import { classesPageMetadata } from "@/features/dashboard/model/page-metadata"
import { loadClasses } from "@/features/classes/server/load-classes"
import { ClassesCardsView } from "@/features/classes/view/classes-cards-view"

export const metadata = classesPageMetadata

export default async function ClassesPage() {
  const { classes } = await loadClasses()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ClassesCardsView classes={classes} />
    </div>
  )
}
