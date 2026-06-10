import { render } from "@react-email/render"
import _SupportTicketStatusUpdatedEmail from "@workspace/transactional/emails/support-ticket-status-updated"

import { buildStudentTicketTrackUrl } from "@/lib/app-urls"
import { type EmailProvider, emailProvider } from "@/lib/email"

const SupportTicketStatusUpdatedEmail: typeof _SupportTicketStatusUpdatedEmail =
  typeof _SupportTicketStatusUpdatedEmail === "function"
    ? _SupportTicketStatusUpdatedEmail
    : (
        _SupportTicketStatusUpdatedEmail as {
          default: typeof _SupportTicketStatusUpdatedEmail
        }
      ).default

export class SupportTicketEmailService {
  constructor(private readonly provider: EmailProvider = emailProvider) {}

  async sendStatusUpdatedEmail(input: {
    ticketId: string
    ticketNumber: string
    statusLabel: string
    adminNote: string | null
    student: {
      firstName: string
      email: string
    }
  }): Promise<void> {
    const html = await render(
      SupportTicketStatusUpdatedEmail({
        firstName: input.student.firstName || "there",
        ticketNumber: input.ticketNumber,
        statusLabel: input.statusLabel,
        adminNote: input.adminNote,
        trackUrl: buildStudentTicketTrackUrl(input.ticketId),
      })
    )

    await this.provider.send({
      to: input.student.email,
      subject: `Ticket ${input.ticketNumber} — ${input.statusLabel}`,
      html,
    })
  }
}

export const supportTicketEmailService = new SupportTicketEmailService()
