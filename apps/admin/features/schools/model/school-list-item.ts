import type { SchoolSubscriptionStatus as PrismaSchoolSubscriptionStatus } from "@prisma/client"
import { z } from "zod"

export type SchoolBoardKind = "board" | "university"

export type SchoolSubscriptionStatus =
  | "active"
  | "inactive"
  | "hold"
  | "blocked"

export type SchoolSyllabusStatus =
  | "assigned"
  | "not_assigned"
  | "partially_assigned"

export type SchoolListItem = {
  id: string
  schoolCode: string
  name: string
  code: string | null
  boardId: string
  boardName: string
  boardKind: SchoolBoardKind
  boardKindLabel: string
  classCount: number
  studentCount: number
  syllabusStatus: SchoolSyllabusStatus
  syllabusLabel: string
  subscriptionStatus: SchoolSubscriptionStatus
  subscriptionLabel: string
}

export type BoardOption = {
  id: string
  name: string
  kindLabel: string
}

export const schoolInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160, "Name is too long"),
  code: z
    .string()
    .trim()
    .max(40, "Code is too long")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
  boardId: z.string().trim().min(1, "Select a board"),
  subscriptionStatus: z.enum(["active", "inactive", "hold", "blocked"]),
})

export type SchoolInput = z.infer<typeof schoolInputSchema>

export const schoolCreateInputSchema = schoolInputSchema.omit({ subscriptionStatus: true }).extend({
  billingEmail: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional()
    .refine(
      (value) => value === null || value === undefined || z.string().email().safeParse(value).success,
      "Enter a valid billing email"
    ),
  contact: z.object({
    fullName: z.string().trim().min(1, "Full name is required").max(120),
    designation: z.string().trim().min(1, "Designation is required").max(120),
    email: z.string().trim().email("Enter a valid contact email"),
    phone: z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .optional(),
  }),
})

export type SchoolCreateInput = z.infer<typeof schoolCreateInputSchema>

export function formatSchoolDisplayCode(code: string | null, id: string): string {
  const trimmed = code?.trim()
  if (trimmed) return trimmed.toUpperCase()
  return id.slice(0, 8).toUpperCase()
}

export function schoolDetailHref(schoolCode: string): string {
  return `/schools/${encodeURIComponent(schoolCode)}`
}

export function parseSchoolRouteCode(routeCode: string): string {
  return decodeURIComponent(routeCode).trim()
}

export function formatBoardKindLabel(kind: SchoolBoardKind): string {
  return kind === "university" ? "University" : "Board"
}

export function mapPrismaBoardKind(kind: "BOARD" | "UNIVERSITY"): SchoolBoardKind {
  return kind === "UNIVERSITY" ? "university" : "board"
}

export function mapPrismaSubscriptionStatus(
  status: PrismaSchoolSubscriptionStatus
): SchoolSubscriptionStatus {
  switch (status) {
    case "INACTIVE":
      return "inactive"
    case "HOLD":
      return "hold"
    case "BLOCKED":
      return "blocked"
    default:
      return "active"
  }
}

export function mapSubscriptionStatusToPrisma(
  status: SchoolSubscriptionStatus
): PrismaSchoolSubscriptionStatus {
  switch (status) {
    case "inactive":
      return "INACTIVE"
    case "hold":
      return "HOLD"
    case "blocked":
      return "BLOCKED"
    default:
      return "ACTIVE"
  }
}

export function formatSubscriptionLabel(status: SchoolSubscriptionStatus): string {
  switch (status) {
    case "inactive":
      return "Inactive"
    case "hold":
      return "Hold"
    case "blocked":
      return "Blocked"
    default:
      return "Active"
  }
}

export function deriveSchoolSyllabusStatus(
  classRows: ReadonlyArray<{ subjectCount: number }>
): SchoolSyllabusStatus {
  if (classRows.length === 0) return "not_assigned"

  const assignedCount = classRows.filter((row) => row.subjectCount > 0).length
  if (assignedCount === 0) return "not_assigned"
  if (assignedCount === classRows.length) return "assigned"
  return "partially_assigned"
}

export function formatSyllabusLabel(status: SchoolSyllabusStatus): string {
  switch (status) {
    case "assigned":
      return "Assigned"
    case "partially_assigned":
      return "Partially Assigned"
    default:
      return "Not Assigned"
  }
}
