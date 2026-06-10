import {
  type QueryDetail,
  type QueryListItem,
  ticketStatusLabel,
  updateTicketStatusSchema,
  type UpdateTicketStatusInput,
} from "../model/support-ticket"
import {
  type SupportTicketRepository,
  supportTicketRepository,
} from "../repository/support-ticket.repository"
import { notificationService } from "@/features/notifications/service/notification.service"

import {
  type SupportTicketEmailService,
  supportTicketEmailService,
} from "./support-ticket-email.service"

export class SupportTicketService {
  constructor(
    private readonly repository: SupportTicketRepository = supportTicketRepository,
    private readonly emails: SupportTicketEmailService = supportTicketEmailService
  ) {}

  async listTickets(): Promise<QueryListItem[]> {
    return this.repository.listTickets()
  }

  async getTicket(ticketId: string): Promise<QueryDetail | null> {
    return this.repository.findById(ticketId)
  }

  async updateTicketStatus(raw: UpdateTicketStatusInput) {
    const parsed = updateTicketStatusSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid ticket update")
    }

    const existing = await this.repository.findById(parsed.data.ticketId)
    if (!existing) {
      throw new Error("Ticket not found.")
    }

    const adminNote =
      parsed.data.adminNote?.trim() || existing.adminNote || null

    const updated = await this.repository.updateStatus({
      ticketId: parsed.data.ticketId,
      status: parsed.data.status,
      adminNote,
    })

    if (existing.status !== updated.status) {
      try {
        await notificationService.notifyStudentSupportTicketStatusUpdated({
          userId: updated.user.id,
          ticketId: updated.id,
          ticketNumber: existing.ticketNumber,
          status: updated.status,
          adminNote,
        })
      } catch (error) {
        console.error("[queries] student notification error:", error)
      }

      try {
        await notificationService.notifyAdminsSupportTicketStatusUpdated({
          ticketId: updated.id,
          ticketNumber: existing.ticketNumber,
          status: updated.status,
          studentName: existing.studentName,
        })
      } catch (error) {
        console.error("[queries] admin notification error:", error)
      }

      try {
        await this.emails.sendStatusUpdatedEmail({
          ticketId: updated.id,
          ticketNumber: existing.ticketNumber,
          statusLabel: ticketStatusLabel(updated.status),
          adminNote,
          student: {
            firstName: updated.user.firstName,
            email: updated.user.email,
          },
        })
      } catch (error) {
        console.error("[queries] status email error:", error)
      }
    }

    return this.repository.findById(parsed.data.ticketId)
  }
}

export const supportTicketService = new SupportTicketService()
