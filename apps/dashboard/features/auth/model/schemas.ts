import { z } from "zod"

export const loginModeSchema = z.enum(["individual", "school"])

export type LoginMode = z.infer<typeof loginModeSchema>

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Enter your username or email.")
    .max(255, "Username or email must be at most 255 characters."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .min(8, "Password must be at least 8 characters."),
  loginMode: loginModeSchema,
})

export type LoginValues = z.infer<typeof loginSchema>

const phoneDigits = (value: string) => value.replace(/\D/g, "")

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your full name.")
    .min(2, "Full name must be at least 2 characters.")
    .max(120, "Full name must be at most 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address.")
    .max(255, "Email must be at most 255 characters."),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number.")
    .refine((value) => {
      const digits = phoneDigits(value)
      return digits.length >= 10 && digits.length <= 15
    }, "Enter a valid phone number (10–15 digits)."),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Enter your date of birth.")
    .refine((value) => {
      const date = new Date(value)
      return !Number.isNaN(date.getTime())
    }, "Enter a valid date of birth.")
    .refine((value) => {
      const date = new Date(value)
      const now = new Date()
      if (date >= now) return false
      const ageMs = now.getTime() - date.getTime()
      const years = ageMs / (1000 * 60 * 60 * 24 * 365.25)
      return years >= 5 && years <= 100
    }, "You must be between 5 and 100 years old."),
  password: z
    .string()
    .min(1, "Enter a password.")
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
})

export type RegisterValues = z.infer<typeof registerSchema>

export function splitFullName(fullName: string): {
  firstName: string
  lastName: string
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const firstName = parts[0] ?? ""
  const lastName = parts.slice(1).join(" ")
  return { firstName, lastName }
}

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Enter a new password.")
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters."),
    confirmNewPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  })

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const changePasswordApiSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
})

export type ChangePasswordApiValues = z.infer<typeof changePasswordApiSchema>

export const resetPasswordApiSchema = z.object({
  token: z.string().trim().min(1, "Reset link is invalid or expired."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
})

export type ResetPasswordApiValues = z.infer<typeof resetPasswordApiSchema>

export function fieldErrorsFromZod(
  error: z.ZodError
): Partial<Record<string, string>> {
  const flat = error.flatten().fieldErrors
  const out: Partial<Record<string, string>> = {}
  for (const key of Object.keys(flat)) {
    const messages = flat[key as keyof typeof flat]
    if (Array.isArray(messages) && messages[0]) {
      out[key] = messages[0]
    }
  }
  return out
}
