export type SchoolBoardKind = "board" | "university"

export type SchoolListItem = {
  id: string
  schoolCode: string
  name: string
  boardName: string
  boardKind: SchoolBoardKind
  boardKindLabel: string
  classCount: number
  studentCount: number
}

export function formatSchoolDisplayCode(code: string | null, id: string): string {
  const trimmed = code?.trim()
  if (trimmed) return trimmed.toUpperCase()
  return id.slice(0, 8).toUpperCase()
}

export function formatBoardKindLabel(kind: SchoolBoardKind): string {
  return kind === "university" ? "University" : "Board"
}

export function mapPrismaBoardKind(kind: "BOARD" | "UNIVERSITY"): SchoolBoardKind {
  return kind === "UNIVERSITY" ? "university" : "board"
}
