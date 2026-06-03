import { z } from "zod"

export type BoardClassOption = {
  name: string
  displayName: string
}

export const createSchoolClassesSchema = z.object({
  names: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one class"),
})
