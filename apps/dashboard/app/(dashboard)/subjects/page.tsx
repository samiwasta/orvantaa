import { loadSubjects } from "@/features/curriculum/server/load-subjects"
import { subjectsPageMetadata } from "@/features/subjects/model/page-metadata"
import { SubjectsView } from "@/features/subjects/view/subjects-view"

export const metadata = subjectsPageMetadata

export default async function SubjectsPage() {
  const subjects = await loadSubjects()
  return <SubjectsView subjects={subjects} />
}
