import type { SupportTicketStatus } from "@prisma/client"

import { formatClassLabel, formatUserFullName } from "@/features/user/model/user"
import { prisma } from "@/lib/db"

import {
  issueAreaLabel,
  type QueryDetail,
  type QueryListItem,
  previewMessage,
  ticketStatusLabel,
} from "../model/support-ticket"

export class SupportTicketRepository {
  async listTickets(): Promise<QueryListItem[]> {
    const rows = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: {
            section: {
              include: { class: true },
            },
          },
        },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      ticketNumber: row.ticketNumber,
      issueArea: row.issueArea,
      issueAreaLabel: issueAreaLabel(row.issueArea),
      status: row.status,
      statusLabel: ticketStatusLabel(row.status),
      studentName: formatUserFullName(row.user.firstName, row.user.lastName),
      studentEmail: row.user.email,
      classLabel: row.user.section
        ? formatClassLabel(row.user.section.class.name, row.user.section.name)
        : null,
      messagePreview: previewMessage(row.message),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  async findById(ticketId: string): Promise<QueryDetail | null> {
    const row = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          include: {
            section: {
              include: {
                class: {
                  include: { school: true },
                },
              },
            },
          },
        },
      },
    })
    if (!row) return null

    return {
      id: row.id,
      ticketNumber: row.ticketNumber,
      issueArea: row.issueArea,
      issueAreaLabel: issueAreaLabel(row.issueArea),
      status: row.status,
      statusLabel: ticketStatusLabel(row.status),
      studentName: formatUserFullName(row.user.firstName, row.user.lastName),
      studentEmail: row.user.email,
      classLabel: row.user.section
        ? formatClassLabel(row.user.section.class.name, row.user.section.name)
        : null,
      schoolName: row.user.section?.class.school.name ?? null,
      username: row.user.username,
      studentCode: row.user.studentCode,
      phone: row.user.phone,
      messagePreview: previewMessage(row.message),
      message: row.message,
      adminNote: row.adminNote,
      resolvedAt: row.resolvedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async updateStatus(input: {
    ticketId: string
    status: SupportTicketStatus
    adminNote?: string | null
  }) {
    const resolvedAt =
      input.status === "RESOLVED" || input.status === "CLOSED"
        ? new Date()
        : input.status === "OPEN" || input.status === "IN_PROGRESS"
          ? null
          : undefined

    return prisma.supportTicket.update({
      where: { id: input.ticketId },
      data: {
        status: input.status,
        adminNote:
          input.adminNote !== undefined ? input.adminNote || null : undefined,
        ...(resolvedAt !== undefined ? { resolvedAt } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            email: true,
          },
        },
      },
    })
  }
}

export const supportTicketRepository = new SupportTicketRepository()
