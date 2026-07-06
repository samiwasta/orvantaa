import type { Metadata } from "next"

import { loadGoalsPageForCurrentStudent } from "@/features/goals/server/load-goals-page"
import { GoalsView } from "@/features/goals/view/goals-view"

export const metadata: Metadata = {
  title: "Goals - Orvantaa",
  description: "Personalized study goals aligned with your exam",
}

export default async function GoalsPage() {
  const data = await loadGoalsPageForCurrentStudent()

  return <GoalsView data={data} />
}
