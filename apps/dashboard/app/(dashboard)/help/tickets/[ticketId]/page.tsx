import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadTicketDetail } from "@/features/support/server/load-ticket-detail"
import { TicketDetailView } from "@/features/support/view/ticket-detail-view"

type PageProps = {
  params: Promise<{ ticketId: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { ticketId } = await params
  const ticket = await loadTicketDetail(ticketId)
  return {
    title: ticket
      ? `${ticket.ticketNumber} - Help - Orvantaa`
      : "Ticket - Orvantaa",
  }
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { ticketId } = await params
  const ticket = await loadTicketDetail(ticketId)
  if (!ticket) notFound()

  return <TicketDetailView ticket={ticket} />
}
