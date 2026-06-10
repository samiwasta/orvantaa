import { z } from "zod"

import type { UserGender } from "@/features/sidebar/model/user-gender"

export type ProfilePageData = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string | null
  gender: UserGender
  classLabel: string | null
  schoolName: string | null
  studentCode: string | null
}

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .optional()
    .default(""),
  gender: z.enum(["male", "female"]),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

export const profilePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmNewPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })

export type ProfilePasswordInput = z.infer<typeof profilePasswordSchema>
