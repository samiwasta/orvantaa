export const STUDENT_CODE_PREFIX = "ORVNT"
export const STUDENT_CODE_MIN_DIGITS = 4

export function formatOrvntStudentCode(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Invalid student code sequence.")
  }

  const width = Math.max(STUDENT_CODE_MIN_DIGITS, String(sequence).length)
  return `${STUDENT_CODE_PREFIX}${String(sequence).padStart(width, "0")}`
}

export function parseOrvntStudentCodeSequence(code: string): number | null {
  const normalized = code.trim().toUpperCase()
  if (!normalized.startsWith(STUDENT_CODE_PREFIX)) return null

  const digits = normalized.slice(STUDENT_CODE_PREFIX.length)
  if (!/^\d+$/.test(digits)) return null

  const value = Number.parseInt(digits, 10)
  return Number.isFinite(value) && value > 0 ? value : null
}

export function maxOrvntStudentCodeSequence(codes: Iterable<string>): number {
  let max = 0
  for (const code of codes) {
    const sequence = parseOrvntStudentCodeSequence(code)
    if (sequence !== null) {
      max = Math.max(max, sequence)
    }
  }
  return max
}
