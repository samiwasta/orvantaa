import { notificationService } from "@/features/notifications/service/notification.service"

import {
  type CreateSupportTicketInput,
  createSupportTicketSchema,
  type HelpPageData,
  type StudentTicketDetail,
} from "../model/support-ticket"
import { previewMessage } from "../model/support-ticket"
import {
  type SupportTicketRepository,
  supportTicketRepository,
} from "../repository/support-ticket.repository"
import {
  type SupportTicketEmailService,
  supportTicketEmailService,
} from "./support-ticket-email.service"

export class SupportTicketService {
  constructor(
    private readonly repository: SupportTicketRepository = supportTicketRepository,
    private readonly emails: SupportTicketEmailService = supportTicketEmailService
  ) {}

  async getHelpPageData(userId: string): Promise<HelpPageData> {
    const tickets = await this.repository.listForUser(userId)
    return { tickets }
  }

  async getTicketForUser(
    userId: string,
    ticketId: string
  ): Promise<StudentTicketDetail | null> {
    return this.repository.findForUser(userId, ticketId)
  }

  async createTicket(userId: string, raw: CreateSupportTicketInput) {
    const parsed = createSupportTicketSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid ticket data")
    }

    const ticketNumber = await this.repository.generateTicketNumber()
    const ticket = await this.repository.createTicket({
      userId,
      ticketNumber,
      issueArea: parsed.data.issueArea,
      message: parsed.data.message,
    })

    const [context, adminEmails] = await Promise.all([
      this.repository.findCreatedTicketContext(ticket.id),
      this.repository.listAdminEmails(),
    ])

    if (context) {
      try {
        await notificationService.notifySupportTicketCreated({
          userId,
          ticketId: context.id,
          ticketNumber: context.ticketNumber,
          issueAreaLabel: context.issueAreaLabel,
        })
      } catch (error) {
        console.error("[support-ticket] student notification error:", error)
      }

      try {
        await notificationService.notifyAdminsOfSupportTicket({
          ticketId: context.id,
          ticketNumber: context.ticketNumber,
          issueAreaLabel: context.issueAreaLabel,
          studentName: context.student.fullName || context.student.firstName,
          messagePreview: previewMessage(context.message),
        })
      } catch (error) {
        console.error("[support-ticket] admin notification error:", error)
      }

      try {
        await this.emails.sendTicketCreatedEmails({
          ticketId: context.id,
          ticketNumber: context.ticketNumber,
          issueAreaLabel: context.issueAreaLabel,
          message: context.message,
          student: {
            firstName: context.student.firstName,
            fullName: context.student.fullName,
            email: context.student.email,
            classLabel: context.student.classLabel,
          },
          adminEmails,
        })
      } catch (error) {
        console.error("[support-ticket] email error:", error)
      }
    }

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
    }
  }
}

export const supportTicketService = new SupportTicketService()
