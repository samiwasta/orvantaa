"use server"

import { revalidatePath } from "next/cache"

import {
  actionError,
  actionOk,
  type ActionResult,
  parseInput,
} from "@/lib/actions/action-result"
import { requireStudentSession } from "@/lib/auth/session"

import { createSupportTicketSchema } from "../model/support-ticket"
import { supportTicketService } from "../service/support-ticket.service"

export async function createSupportTicketAction(
  raw: unknown
): Promise<ActionResult<{ id: string; ticketNumber: string }>> {
  let session
  try {
    session = await requireStudentSession()
  } catch {
    return actionError("You must be signed in.")
  }

  const parsed = parseInput(createSupportTicketSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const ticket = await supportTicketService.createTicket(
      session.sub,
      parsed.data
    )
    revalidatePath("/help", "layout")
    revalidatePath(`/help/tickets/${ticket.id}`)
    return actionOk(ticket, "Support ticket raised")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not raise your ticket."
    return actionError(message)
  }
}
