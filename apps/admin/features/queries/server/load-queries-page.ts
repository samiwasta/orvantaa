import { cache } from "react"

import { requireAdminSession } from "@/lib/auth/session"

import type { QueryListItem } from "../model/support-ticket"
import { supportTicketService } from "../service/support-ticket.service"

export const loadQueriesPage = cache(async (): Promise<QueryListItem[]> => {
  await requireAdminSession()
  return supportTicketService.listTickets()
})
