import type { SupportTicketIssueArea } from "@prisma/client"

import {
  formatClassLabel,
  formatUserFullName,
} from "@/features/user/model/user"
import { prisma } from "@/lib/db"

import {
  issueAreaLabel,
  type StudentTicketDetail,
  type StudentTicketListItem,
  ticketStatusLabel,
} from "../model/support-ticket"

function mapListItem(row: {
  id: string
  ticketNumber: string
  issueArea: SupportTicketIssueArea
  status: StudentTicketListItem["status"]
  createdAt: Date
}): StudentTicketListItem {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    issueArea: row.issueArea,
    issueAreaLabel: issueAreaLabel(row.issueArea),
    status: row.status,
    statusLabel: ticketStatusLabel(row.status),
    createdAt: row.createdAt,
  }
}

export class SupportTicketRepository {
  async generateTicketNumber(): Promise<string> {
    const count = await prisma.supportTicket.count()
    return `ORV-${String(count + 1).padStart(6, "0")}`
  }

  async createTicket(input: {
    userId: string
    ticketNumber: string
    issueArea: SupportTicketIssueArea
    message: string
  }) {
    return prisma.supportTicket.create({
      data: {
        userId: input.userId,
        ticketNumber: input.ticketNumber,
        issueArea: input.issueArea,
        message: input.message,
      },
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
  }

  async listForUser(userId: string): Promise<StudentTicketListItem[]> {
    const rows = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketNumber: true,
        issueArea: true,
        status: true,
        createdAt: true,
      },
    })
    return rows.map(mapListItem)
  }

  async findForUser(
    userId: string,
    ticketId: string
  ): Promise<StudentTicketDetail | null> {
    const row = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
      select: {
        id: true,
        ticketNumber: true,
        issueArea: true,
        status: true,
        message: true,
        adminNote: true,
        resolvedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!row) return null

    return {
      ...mapListItem(row),
      message: row.message,
      adminNote: row.adminNote,
      resolvedAt: row.resolvedAt,
      updatedAt: row.updatedAt,
    }
  }

  async findCreatedTicketContext(ticketId: string) {
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

    const classLabel = row.user.section
      ? formatClassLabel(row.user.section.class.name, row.user.section.name)
      : null

    return {
      id: row.id,
      ticketNumber: row.ticketNumber,
      issueArea: row.issueArea,
      issueAreaLabel: issueAreaLabel(row.issueArea),
      message: row.message,
      student: {
        id: row.user.id,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        fullName: formatUserFullName(row.user.firstName, row.user.lastName),
        email: row.user.email,
        classLabel,
        schoolName: row.user.section?.class.school.name ?? null,
      },
    }
  }

  async listAdminEmails(): Promise<string[]> {
    const rows = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
      orderBy: { createdAt: "asc" },
    })
    return rows.map((row) => row.email)
  }
}

export const supportTicketRepository = new SupportTicketRepository()
