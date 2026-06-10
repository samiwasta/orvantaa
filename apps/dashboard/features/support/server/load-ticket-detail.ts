import { cache } from "react"

import { requireStudentSession } from "@/lib/auth/session"

import type { StudentTicketDetail } from "../model/support-ticket"
import { supportTicketService } from "../service/support-ticket.service"

export const loadTicketDetail = cache(
  async (ticketId: string): Promise<StudentTicketDetail | null> => {
    const session = await requireStudentSession()
    return supportTicketService.getTicketForUser(session.sub, ticketId)
  }
)
