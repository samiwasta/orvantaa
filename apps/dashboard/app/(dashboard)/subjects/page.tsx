import { loadSubjects } from "@/features/curriculum/server/load-subjects"
import { SubjectsView } from "@/features/subjects/view/subjects-view"

export default async function SubjectsPage() {
  const subjects = await loadSubjects()
  return <SubjectsView subjects={subjects} />
}
