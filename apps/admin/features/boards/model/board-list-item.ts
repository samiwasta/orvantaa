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
