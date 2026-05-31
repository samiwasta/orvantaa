export type ClassListItem = {
  id: string
  schoolId: string
  className: string
  classDisplayName: string
  section: string | null
  schoolName: string
  schoolCode: string
  boardName: string
  studentCount: number
  subjectCount: number
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

  const sectionA = a.section ?? ""
  const sectionB = b.section ?? ""
  return sectionA.localeCompare(sectionB)
}
