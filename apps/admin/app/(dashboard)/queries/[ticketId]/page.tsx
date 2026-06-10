import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadQueryDetail } from "@/features/queries/server/load-query-detail"
import { QueryDetailView } from "@/features/queries/view/query-detail-view"

type PageProps = {
  params: Promise<{ ticketId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticketId } = await params
  const ticket = await loadQueryDetail(ticketId)
  return {
    title: ticket
      ? `${ticket.ticketNumber} - Queries - Orvantaa Admin`
      : "Query - Orvantaa Admin",
  }
}

export default async function QueryDetailPage({ params }: PageProps) {
  const { ticketId } = await params
  const ticket = await loadQueryDetail(ticketId)
  if (!ticket) notFound()

  return <QueryDetailView ticket={ticket} />
}
