import { z } from "zod"

const examKeySchema = z.enum(["unit1", "term1", "unit2", "final"])

const examMarksSchema = z.object({
  unit1: z.number().int().min(0).nullable(),
  term1: z.number().int().min(0).nullable(),
  unit2: z.number().int().min(0).nullable(),
  final: z.number().int().min(0).nullable(),
})

const examMaxMarksSchema = z.object({
  unit1: z.number().int().min(1).max(1000),
  term1: z.number().int().min(1).max(1000),
  unit2: z.number().int().min(1).max(1000),
  final: z.number().int().min(1).max(1000),
})

export const saveReportCardSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  exams: z
    .array(
      z.object({
        key: examKeySchema,
        label: z.string().trim().min(1).max(80),
        maxMarks: z.number().int().min(1).max(1000),
      })
    )
    .min(1)
    .max(6),
  subjects: z.array(
    z.object({
      subjectId: z.string().min(1),
      scores: examMarksSchema,
      maxMarks: examMaxMarksSchema,
    })
  ),
})

export function parseSaveReportCard(body: unknown) {
  return saveReportCardSchema.safeParse(body)
}

export type SaveReportCardInput = z.infer<typeof saveReportCardSchema>
