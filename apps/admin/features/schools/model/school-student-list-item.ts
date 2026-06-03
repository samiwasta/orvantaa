import { z } from "zod"

import { formatClassDisplayName } from "@/features/classes/model/class-list-item"

export type SchoolClassTab = {
  id: string
  className: string
  classDisplayName: string
}

export type SchoolSectionOption = {
  id: string
  name: string
  classId: string
  classDisplayName: string
}

export type StudentMailStatus = "sent" | "not_sent"

export type SchoolStudentListItem = {
  id: string
  studentCode: string
  fullName: string
  firstName: string
  lastName: string
  classId: string | null
  classDisplayName: string | null
  sectionId: string | null
  sectionName: string | null
  email: string
  phone: string | null
  username: string
  mailStatus: StudentMailStatus
  mailStatusLabel: string
}

export type SchoolSyllabusClassRow = {
  classId: string
  classDisplayName: string
  subjectCount: number
}

export function formatStudentDisplayCode(
  studentCode: string | null,
  username: string,
  id: string
): string {
  const fromCode = studentCode?.trim()
  if (fromCode) return fromCode.toUpperCase()
  const fromUsername = username.trim()
  if (fromUsername) return fromUsername.toUpperCase()
  return id.slice(0, 8).toUpperCase()
}

export function formatStudentFullName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
}

export function mapPrismaMailStatus(
  status: "NOT_SENT" | "SENT"
): StudentMailStatus {
  return status === "SENT" ? "sent" : "not_sent"
}

export function formatMailStatusLabel(status: StudentMailStatus): string {
  return status === "sent" ? "Sent" : "Not Sent"
}

export const schoolStudentInputSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
  studentCode: z
    .string()
    .trim()
    .max(40, "Student code is too long")
    .transform((value) => (value === "" ? null : value.toUpperCase()))
    .nullable()
    .optional(),
  sectionId: z.string().trim().min(1, "Select a class and section"),
  password: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length === 0 || value.trim().length >= 6,
      "Password must be at least 6 characters"
    ),
})

export const schoolStudentCreateSchema = schoolStudentInputSchema.omit({
  studentCode: true,
  password: true,
})

export type SchoolStudentInput = z.infer<typeof schoolStudentInputSchema>

export function mapClassTab(className: string, id: string): SchoolClassTab {
  return {
    id,
    className,
    classDisplayName: formatClassDisplayName(className),
  }
}
