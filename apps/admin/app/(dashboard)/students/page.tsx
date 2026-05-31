import type { Metadata } from "next"

import { loadStudents } from "@/features/students/server/load-students"
import { StudentsTable } from "@/features/students/view/students-table"

export const metadata: Metadata = {
  title: "Students - Orvantaa Admin",
  description: "View and manage student accounts",
}

export default async function StudentsPage() {
  const { students } = await loadStudents()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <StudentsTable students={students} />
    </div>
  )
}
