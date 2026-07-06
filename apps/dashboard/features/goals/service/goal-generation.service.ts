import { getAiTutorProvider } from "@/lib/ai/config"
import { generateGeminiStudentGoals } from "@/lib/ai/gemini/generate-student-goals"
import { generateGroqStudentGoals } from "@/lib/ai/groq/generate-student-goals"

import { parseAiGoalsResponse } from "../model/goal-request"
import type { GeneratedGoalDraft } from "../model/student-goal"
import type { GoalGenerationContext } from "../repository/goal-context.repository"
import {
  buildRuleBasedGoals,
  validateGeneratedGoals,
} from "./goal-validator.service"

function buildContextPayload(context: GoalGenerationContext) {
  return {
    studentName: context.studentName,
    exam: context.examTarget
      ? {
          name: context.examTarget.examName,
          date: context.examTarget.examDate.toISOString().slice(0, 10),
          daysRemaining: context.daysUntilExam,
        }
      : null,
    syllabus: {
      completedChapters: context.syllabus.completedChapters,
      totalChapters: context.syllabus.totalChapters,
      nextIncomplete: context.syllabus.nextChapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        subject: chapter.subjectTitle,
        progressPercent: chapter.progressPercent,
        hasQuiz: chapter.hasQuiz,
        quizId: chapter.quizId,
      })),
    },
    performance: {
      averageQuizScore: context.performance.averageQuizScore,
      studyStreak: context.performance.studyStreak,
      weakAreas: context.performance.weakAreas,
    },
    recentActivity: context.recentActivity,
  }
}

async function generateWithAi(
  context: GoalGenerationContext
): Promise<GeneratedGoalDraft[] | null> {
  const provider = getAiTutorProvider()
  if (!provider) return null

  const payload = JSON.stringify(buildContextPayload(context), null, 2)
  const raw =
    provider === "groq"
      ? await generateGroqStudentGoals(payload)
      : await generateGeminiStudentGoals(payload)

  if (!raw) return null

  try {
    const parsed = parseAiGoalsResponse(JSON.parse(raw))
    if (!parsed.success) return null
    return validateGeneratedGoals(parsed.data.goals, context)
  } catch {
    return null
  }
}

export async function generateStudentGoals(
  context: GoalGenerationContext
): Promise<{ goals: GeneratedGoalDraft[]; source: "AI" | "SYSTEM" }> {
  const aiGoals = await generateWithAi(context)
  if (aiGoals && aiGoals.length > 0) {
    return { goals: aiGoals, source: "AI" }
  }

  return {
    goals: validateGeneratedGoals(buildRuleBasedGoals(context), context),
    source: "SYSTEM",
  }
}
