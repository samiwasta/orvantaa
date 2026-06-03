import { randomBytes } from "crypto"
import { z } from "zod"

export const CSV_IMPORT_HEADERS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "class",
  "section",
] as const

export const csvStudentRowSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().trim().min(1, "Phone number is required"),
  className: z.string().trim().min(1, "Class is required"),
  sectionName: z.string().trim().min(1, "Section is required"),
})

export type CsvStudentRow = z.infer<typeof csvStudentRowSchema>

const HEADER_ALIASES: Record<string, keyof CsvStudentRow | "className" | "sectionName"> = {
  first_name: "firstName",
  firstname: "firstName",
  "first name": "firstName",
  last_name: "lastName",
  lastname: "lastName",
  "last name": "lastName",
  email: "email",
  phone: "phone",
  "phone number": "phone",
  class: "className",
  grade: "className",
  section: "sectionName",
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim())
      current = ""
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells
}

export function buildStudentCodeBase(firstName: string, lastName: string): string {
  const first = firstName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()
  const last = (lastName ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()
  const combined = `${first}${last}`.replace(/[^A-Z0-9]/g, "")
  return (combined.length >= 3 ? combined : `STU${combined}`).slice(0, 12)
}

export function generateRandomPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const bytes = randomBytes(length)
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("")
}

export function parseStudentsCsv(text: string): {
  rows: Record<string, string>[]
  error?: string
} {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return { rows: [], error: "CSV must include a header row and at least one student row." }
  }

  const headerCells = parseCsvLine(lines[0]!)
  const fieldIndexes: Array<keyof CsvStudentRow | "className" | "sectionName" | null> =
    headerCells.map((header) => {
      const key = HEADER_ALIASES[normalizeHeader(header)]
      return key ?? null
    })

  const required: Array<keyof CsvStudentRow | "className" | "sectionName"> = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "className",
    "sectionName",
  ]

  const columnLabel: Record<string, string> = {
    firstName: "first_name",
    lastName: "last_name",
    email: "email",
    phone: "phone",
    className: "class",
    sectionName: "section",
  }

  for (const field of required) {
    if (!fieldIndexes.includes(field)) {
      return {
        rows: [],
        error: `Missing required column: ${columnLabel[field] ?? field}.`,
      }
    }
  }

  const rows: Record<string, string>[] = []

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parseCsvLine(lines[lineIndex]!)
    const record: Record<string, string> = {}

    fieldIndexes.forEach((field, index) => {
      if (!field) return
      record[field] = cells[index] ?? ""
    })

    if (Object.values(record).every((value) => !value.trim())) continue
    rows.push(record)
  }

  if (rows.length === 0) {
    return { rows: [], error: "No student rows found in the CSV file." }
  }

  return { rows }
}
