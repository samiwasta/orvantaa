import { z } from "zod"

const goalMetadataSchema = z.object({
  chapterIds: z.array(z.string().trim().min(1)).max(20).optional(),
  subjectSlug: z.string().trim().min(1).max(120).optional(),
  chapterSlug: z.string().trim().min(1).max(120).optional(),
  quizId: z.string().trim().min(1).max(80).optional(),
  minQuizScore: z.number().int().min(40).max(100).optional(),
  targetStreak: z.number().int().min(1).max(30).optional(),
})

export const upsertExamTargetSchema = z.object({
  examName: z.string().trim().min(2).max(80),
  examDate: z.string().trim().min(1),
})

export const generatedGoalDraftSchema = z.object({
  type: z.enum([
    "COMPLETE_CHAPTERS",
    "REVISE_CHAPTER",
    "PASS_QUIZ",
    "IMPROVE_WEAK_AREA",
    "MAINTAIN_STREAK",
  ]),
  title: z.string().trim().min(4).max(100),
  description: z.string().trim().max(220).optional(),
  rationale: z.string().trim().max(280).optional(),
  targetCount: z.number().int().min(1).max(10),
  periodDays: z.number().int().min(1).max(21),
  priority: z.number().int().min(0).max(100).optional(),
  href: z.string().trim().max(240).optional(),
  metadata: goalMetadataSchema.optional(),
})

export const aiGoalsResponseSchema = z.object({
  goals: z.array(generatedGoalDraftSchema).min(1).max(4),
})

export function parseUpsertExamTarget(raw: unknown) {
  return upsertExamTargetSchema.safeParse(raw)
}

export function parseAiGoalsResponse(raw: unknown) {
  return aiGoalsResponseSchema.safeParse(raw)
}
