import {
  schoolContactInputSchema,
  type SchoolContactInput,
} from "../model/school-contact"
import type { SchoolContactListItem } from "../model/school-contact"
import {
  type SchoolManagementRepository,
  schoolManagementRepository,
} from "../repository/school-management.repository"

export class SchoolManagementService {
  constructor(
    private readonly repository: SchoolManagementRepository = schoolManagementRepository
  ) {}

  async listContacts(schoolId: string): Promise<SchoolContactListItem[]> {
    return this.repository.findContactsBySchoolId(schoolId)
  }

  async getBillingEmail(schoolId: string): Promise<string | null> {
    return this.repository.findBillingEmail(schoolId)
  }

  async updateBillingEmail(
    schoolId: string,
    billingEmail: string | null
  ): Promise<void> {
    await this.repository.updateBillingEmail(schoolId, billingEmail)
  }

  async createContact(schoolId: string, raw: unknown): Promise<void> {
    const parsed = schoolContactInputSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact data")
    }
    await this.repository.createContact(schoolId, parsed.data)
  }

  async updateContact(
    schoolId: string,
    contactId: string,
    raw: unknown
  ): Promise<void> {
    const parsed = schoolContactInputSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact data")
    }
    const ok = await this.repository.contactBelongsToSchool(contactId, schoolId)
    if (!ok) throw new Error("Contact not found for this school.")
    await this.repository.updateContact(contactId, parsed.data)
  }

  async deleteContact(schoolId: string, contactId: string): Promise<void> {
    const ok = await this.repository.contactBelongsToSchool(contactId, schoolId)
    if (!ok) throw new Error("Contact not found for this school.")
    await this.repository.deleteContact(contactId)
  }
}

export const schoolManagementService = new SchoolManagementService()
