import type { BoardKind as PrismaBoardKind } from "@prisma/client"
import { z } from "zod"

export type BoardKind = "board" | "university"

export type BoardListItem = {
  id: string
  name: string
  slug: string
  kind: BoardKind
  kindLabel: string
  code: string | null
  schoolCount: number
}

export function formatBoardKindLabel(kind: BoardKind): string {
  return kind === "university" ? "University" : "Board"
}

export function mapPrismaBoardKind(kind: PrismaBoardKind): BoardKind {
  return kind === "UNIVERSITY" ? "university" : "board"
}

export function mapBoardKindToPrisma(kind: BoardKind): PrismaBoardKind {
  return kind === "university" ? "UNIVERSITY" : "BOARD"
}

const BOARD_NAME_STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "and",
  "for",
  "in",
  "on",
  "at",
  "to",
  "from",
  "with",
])

export function deriveBoardAcronymFromName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""

  const singleToken = trimmed.replace(/[^a-zA-Z0-9]/g, "")
  if (!/\s/.test(trimmed) && singleToken.length >= 2 && singleToken.length <= 12) {
    return singleToken.toUpperCase()
  }

  const words = trimmed
    .split(/[\s,/()-]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)

  const acronym = words
    .filter((word) => !BOARD_NAME_STOP_WORDS.has(word.toLowerCase()))
    .map((word) => word[0]!.toUpperCase())
    .join("")

  return acronym
}

export function deriveBoardSlugFromName(value: string): string {
  const acronym = deriveBoardAcronymFromName(value)
  if (acronym.length >= 2) {
    return acronym.toLowerCase()
  }
  return slugifyBoardName(value)
}

export function deriveBoardCodeFromName(value: string): string {
  return deriveBoardAcronymFromName(value)
}

export function slugifyBoardName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const boardInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens"
    ),
  kind: z.enum(["board", "university"]),
  code: z
    .string()
    .trim()
    .max(40, "Code is too long")
    .transform((value) => (value === "" ? null : value.toUpperCase()))
    .nullable()
    .optional(),
})

export type BoardInput = z.infer<typeof boardInputSchema>
