import { z } from "zod"

export type SchoolBoardKind = "board" | "university"

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
})

export type SchoolInput = z.infer<typeof schoolInputSchema>

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
