import { schoolsPageMetadata } from "@/features/dashboard/model/page-metadata"
import { loadSchools } from "@/features/schools/server/load-schools"
import { SchoolsTable } from "@/features/schools/view/schools-table"

export const metadata = schoolsPageMetadata

export default async function SchoolsPage() {
  const { schools, boardOptions } = await loadSchools()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SchoolsTable schools={schools} boardOptions={boardOptions} />
    </div>
  )
}
