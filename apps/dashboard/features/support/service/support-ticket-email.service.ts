import { render } from "@react-email/render"
import _SupportTicketCreatedAdminEmail from "@workspace/transactional/emails/support-ticket-created-admin"
import _SupportTicketCreatedStudentEmail from "@workspace/transactional/emails/support-ticket-created-student"

import {
  buildAdminQueryDetailUrl,
  buildStudentTicketTrackUrl,
} from "@/lib/app-urls"
import { type EmailProvider, emailProvider } from "@/lib/email"

import { SUPPORT_RESPONSE_TIME_LABEL } from "../model/support-ticket"

const SupportTicketCreatedStudentEmail: typeof _SupportTicketCreatedStudentEmail =
  typeof _SupportTicketCreatedStudentEmail === "function"
    ? _SupportTicketCreatedStudentEmail
    : (
        _SupportTicketCreatedStudentEmail as {
          default: typeof _SupportTicketCreatedStudentEmail
        }
      ).default

const SupportTicketCreatedAdminEmail: typeof _SupportTicketCreatedAdminEmail =
  typeof _SupportTicketCreatedAdminEmail === "function"
    ? _SupportTicketCreatedAdminEmail
    : (
        _SupportTicketCreatedAdminEmail as {
          default: typeof _SupportTicketCreatedAdminEmail
        }
      ).default

function previewMessage(message: string, maxLength = 240): string {
  const trimmed = message.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trimEnd()}…`
}

export class SupportTicketEmailService {
  constructor(private readonly provider: EmailProvider = emailProvider) {}

  async sendTicketCreatedEmails(input: {
    ticketId: string
    ticketNumber: string
    issueAreaLabel: string
    message: string
    student: {
      firstName: string
      fullName: string
      email: string
      classLabel: string | null
    }
    adminEmails: string[]
  }): Promise<void> {
    const studentHtml = await render(
      SupportTicketCreatedStudentEmail({
        firstName: input.student.firstName || "there",
        ticketNumber: input.ticketNumber,
        issueAreaLabel: input.issueAreaLabel,
        responseTimeLabel: SUPPORT_RESPONSE_TIME_LABEL,
        trackUrl: buildStudentTicketTrackUrl(input.ticketId),
      })
    )

    await this.provider.send({
      to: input.student.email,
      subject: `Support ticket ${input.ticketNumber} received`,
      html: studentHtml,
    })

    if (input.adminEmails.length === 0) return

    const adminHtml = await render(
      SupportTicketCreatedAdminEmail({
        ticketNumber: input.ticketNumber,
        issueAreaLabel: input.issueAreaLabel,
        studentName: input.student.fullName || input.student.firstName,
        studentEmail: input.student.email,
        classLabel: input.student.classLabel,
        messagePreview: previewMessage(input.message),
        viewUrl: buildAdminQueryDetailUrl(input.ticketId),
      })
    )

    await Promise.all(
      input.adminEmails.map((email) =>
        this.provider.send({
          to: email,
          subject: `New query ${input.ticketNumber} — ${input.issueAreaLabel}`,
          html: adminHtml,
        })
      )
    )
  }
}

export const supportTicketEmailService = new SupportTicketEmailService()
