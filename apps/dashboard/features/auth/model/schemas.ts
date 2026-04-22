import { z } from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Enter your username.")
    .max(64, "Username must be at most 64 characters."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .min(8, "Password must be at least 8 characters."),
})

export type LoginValues = z.infer<typeof loginSchema>

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
