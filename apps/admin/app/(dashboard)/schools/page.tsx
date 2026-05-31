import type { Metadata } from "next"

import { loadSchools } from "@/features/schools/server/load-schools"
import { SchoolsTable } from "@/features/schools/view/schools-table"

export const metadata: Metadata = {
  title: "Schools - Orvantaa Admin",
  description: "View and manage schools",
}

export default async function SchoolsPage() {
  const { schools, boardOptions } = await loadSchools()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SchoolsTable schools={schools} boardOptions={boardOptions} />
    </div>
  )
}
