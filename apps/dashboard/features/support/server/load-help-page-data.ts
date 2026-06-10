import { cache } from "react"

import { requireStudentSession } from "@/lib/auth/session"

import type { HelpPageData } from "../model/support-ticket"
import { supportTicketService } from "../service/support-ticket.service"

export const loadHelpPageData = cache(async (): Promise<HelpPageData> => {
  const session = await requireStudentSession()
  return supportTicketService.getHelpPageData(session.sub)
})
