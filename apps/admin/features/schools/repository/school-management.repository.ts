import { prisma } from "@/lib/db"

import type { SchoolContactInput } from "../model/school-contact"
import type { SchoolContactListItem } from "../model/school-contact"

function mapRow(row: {
  id: string
  fullName: string
  designation: string
  email: string
  phone: string | null
}): SchoolContactListItem {
  return {
    id: row.id,
    fullName: row.fullName,
    designation: row.designation,
    email: row.email,
    phone: row.phone,
  }
}

export class SchoolManagementRepository {
  async findContactsBySchoolId(schoolId: string): Promise<SchoolContactListItem[]> {
    const rows = await prisma.schoolContact.findMany({
      where: { schoolId },
      orderBy: [{ fullName: "asc" }],
      select: {
        id: true,
        fullName: true,
        designation: true,
        email: true,
        phone: true,
      },
    })
    return rows.map(mapRow)
  }

  async findBillingEmail(schoolId: string): Promise<string | null> {
    const row = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { billingEmail: true },
    })
    return row?.billingEmail ?? null
  }

  async updateBillingEmail(schoolId: string, billingEmail: string | null): Promise<void> {
    await prisma.school.update({
      where: { id: schoolId },
      data: { billingEmail },
    })
  }

  async createContact(schoolId: string, input: SchoolContactInput): Promise<void> {
    await prisma.schoolContact.create({
      data: {
        schoolId,
        fullName: input.fullName.trim(),
        designation: input.designation.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone ?? null,
      },
    })
  }

  async updateContact(id: string, input: SchoolContactInput): Promise<void> {
    await prisma.schoolContact.update({
      where: { id },
      data: {
        fullName: input.fullName.trim(),
        designation: input.designation.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone ?? null,
      },
    })
  }

  async deleteContact(id: string): Promise<void> {
    await prisma.schoolContact.delete({ where: { id } })
  }

  async contactBelongsToSchool(contactId: string, schoolId: string): Promise<boolean> {
    const count = await prisma.schoolContact.count({
      where: { id: contactId, schoolId },
    })
    return count > 0
  }
}

export const schoolManagementRepository = new SchoolManagementRepository()
