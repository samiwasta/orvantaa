"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionResult,
  actionError,
  actionOk,
  parseInput,
} from "@/lib/actions/action-result"
import { requireAdminSession } from "@/lib/auth/session"

import type { QueryDetail } from "../model/support-ticket"
import { updateTicketStatusSchema } from "../model/support-ticket"
import { supportTicketService } from "../service/support-ticket.service"

function revalidateQueryPaths(ticketId: string) {
  revalidatePath("/queries", "layout")
  revalidatePath(`/queries/${ticketId}`)
}

export async function updateQueryStatusAction(
  raw: unknown
): Promise<ActionResult<QueryDetail | null>> {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return actionError("You must be signed in.")
  }
  void session

  const parsed = parseInput(updateTicketStatusSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const ticket = await supportTicketService.updateTicketStatus(parsed.data)
    if (!ticket) {
      return actionError("Ticket not found.")
    }
    revalidateQueryPaths(ticket.id)
    return actionOk(ticket, "Ticket updated")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update the ticket."
    return actionError(message)
  }
}
