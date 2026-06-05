import type { AppUserRole } from "@/features/user/model/user"
import { z } from "zod"

export type TeamMember = {
  id: string
  fullName: string
  username: string
  email: string
  role: AppUserRole
  createdAt: string
}

export const teamMemberCreateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().max(80).optional().default(""),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username is too long")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username may only contain letters, numbers, dots, hyphens, and underscores"
    ),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password is too long"),
})

export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>
