import type { Metadata } from "next"

import { QueriesListView } from "@/features/queries/view/queries-list-view"
import { loadQueriesPage } from "@/features/queries/server/load-queries-page"

export const metadata: Metadata = {
  title: "Queries - Orvantaa Admin",
  description: "Student support tickets",
}

export default async function QueriesPage() {
  const tickets = await loadQueriesPage()
  return <QueriesListView tickets={tickets} />
}
