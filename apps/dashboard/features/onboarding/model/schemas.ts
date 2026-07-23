import { z } from "zod"

import { ACADEMIC_STANDARDS, INDIAN_STATES } from "./academic-options"

export const onboardingSchema = z.object({
  schoolId: z.string().trim().min(1).optional().nullable(),
  schoolName: z
    .string()
    .trim()
    .min(1, "Enter your school name.")
    .min(2, "School name must be at least 2 characters.")
    .max(200, "School name must be at most 200 characters."),
  boardId: z.string().trim().min(1, "Select your board."),
  city: z
    .string()
    .trim()
    .min(1, "Enter your city.")
    .min(2, "City must be at least 2 characters.")
    .max(120, "City must be at most 120 characters."),
  state: z
    .string()
    .trim()
    .min(1, "Select your state.")
    .refine(
      (value) => (INDIAN_STATES as readonly string[]).includes(value),
      "Select a valid state."
    ),
  standard: z
    .string()
    .trim()
    .min(1, "Select your standard.")
    .refine(
      (value) => (ACADEMIC_STANDARDS as readonly string[]).includes(value),
      "Select a valid standard."
    ),
  section: z
    .string()
    .trim()
    .min(1, "Enter your section.")
    .max(40, "Section must be at most 40 characters."),
})

export type OnboardingValues = z.infer<typeof onboardingSchema>

export function fieldErrorsFromZod(
  error: z.ZodError
): Partial<Record<keyof OnboardingValues, string>> {
  const flat = error.flatten().fieldErrors
  const out: Partial<Record<keyof OnboardingValues, string>> = {}
  for (const key of Object.keys(flat) as Array<keyof OnboardingValues>) {
    const messages = flat[key]
    if (Array.isArray(messages) && messages[0]) {
      out[key] = messages[0]
    }
  }
  return out
}
