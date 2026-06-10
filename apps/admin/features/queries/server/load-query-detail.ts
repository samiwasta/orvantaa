import { cache } from "react"

import { requireAdminSession } from "@/lib/auth/session"

import type { QueryDetail } from "../model/support-ticket"
import { supportTicketService } from "../service/support-ticket.service"

export const loadQueryDetail = cache(
  async (ticketId: string): Promise<QueryDetail | null> => {
    await requireAdminSession()
    return supportTicketService.getTicket(ticketId)
  }
)
