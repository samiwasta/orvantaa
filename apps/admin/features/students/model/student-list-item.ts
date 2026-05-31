import { z } from "zod"

export type StudentListItem = {
  id: string
  studentId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  username: string
  phoneNumber: string | null
  schoolName: string | null
  boardName: string | null
  className: string | null
  section: string | null
  sectionId: string | null
  gender: "male" | "female"
}

export type SectionOption = {
  id: string
  label: string
}

export function formatStudentDisplayId(username: string): string {
  return username.trim().toUpperCase()
}

const baseStudentSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(80, "First name is too long"),
  lastName: z.string().trim().max(80, "Last name is too long").default(""),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username is too long")
    .regex(/^[a-z0-9._-]+$/i, "Use letters, numbers, dots, dashes, underscores"),
  email: z.string().trim().email("Enter a valid email").max(160),
  gender: z.enum(["male", "female"]),
  sectionId: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
})

export const studentCreateSchema = baseStudentSchema.extend({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
})

export const studentUpdateSchema = baseStudentSchema.extend({
  password: z
    .string()
    .max(100, "Password is too long")
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || v.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
})

export type StudentCreateInput = z.infer<typeof studentCreateSchema>
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>
