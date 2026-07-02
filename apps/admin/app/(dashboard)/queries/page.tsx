import { queriesPageMetadata } from "@/features/dashboard/model/page-metadata"
import { QueriesListView } from "@/features/queries/view/queries-list-view"
import { loadQueriesPage } from "@/features/queries/server/load-queries-page"

export const metadata = queriesPageMetadata

export default async function QueriesPage() {
  const tickets = await loadQueriesPage()
  return <QueriesListView tickets={tickets} />
}
