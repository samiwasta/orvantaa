import { z } from "zod"

export type ClassSectionItem = {
  id: string
  name: string
  studentCount: number
}

export type ClassListItem = {
  id: string
  schoolId: string
  className: string
  classDisplayName: string
  sections: ClassSectionItem[]
  schoolName: string
  schoolCode: string
  boardName: string
  studentCount: number
  subjectCount: number
}

export type SchoolOption = {
  id: string
  name: string
}

export function classSectionNames(item: ClassListItem): string[] {
  return item.sections
    .map((section) => section.name.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

export function formatClassDisplayName(className: string): string {
  const trimmed = className.trim()
  return /^class\s/i.test(trimmed) ? trimmed : `Class ${trimmed}`
}

export function parseClassLevel(className: string): number {
  const match = className.match(/\d+/)
  return match ? Number.parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER
}

export function formatSchoolCodeForClass(
  code: string | null,
  schoolId: string
): string {
  const trimmed = code?.trim()
  if (trimmed) return trimmed.toUpperCase()
  return schoolId.slice(0, 8).toUpperCase()
}

export function compareClassListItems(a: ClassListItem, b: ClassListItem): number {
  const school = a.schoolName.localeCompare(b.schoolName)
  if (school !== 0) return school

  const levelA = parseClassLevel(a.className)
  const levelB = parseClassLevel(b.className)
  if (levelA !== levelB) return levelA - levelB

  return a.className.localeCompare(b.className)
}

export const classInputSchema = z.object({
  schoolId: z.string().trim().min(1, "Select a school"),
  name: z
    .string()
    .trim()
    .min(1, "Class name is required")
    .max(40, "Class name is too long"),
})

export type ClassInput = z.infer<typeof classInputSchema>

export const sectionInputSchema = z.object({
  classId: z.string().trim().min(1, "Missing class"),
  name: z
    .string()
    .trim()
    .min(1, "Section name is required")
    .max(40, "Section name is too long"),
})

export type SectionInput = z.infer<typeof sectionInputSchema>
