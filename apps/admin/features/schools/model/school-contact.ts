import { z } from "zod"

export type SchoolContactListItem = {
  id: string
  fullName: string
  designation: string
  email: string
  phone: string | null
}

export const schoolContactInputSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  designation: z.string().trim().min(1, "Designation is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
})

export type SchoolContactInput = z.infer<typeof schoolContactInputSchema>

export const schoolBillingEmailSchema = z.object({
  billingEmail: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) => value === null || z.string().email().safeParse(value).success,
      "Enter a valid billing email"
    ),
})

export type SchoolBillingEmailInput = z.infer<typeof schoolBillingEmailSchema>
