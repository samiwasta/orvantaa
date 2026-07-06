import { enrichGoalDraft } from "../model/goal-instructions"
import type { GeneratedGoalDraft } from "../model/student-goal"
import type { GoalGenerationContext } from "../repository/goal-context.repository"

function maxChaptersForPeriod(
  daysUntilExam: number | null,
  periodDays: number
) {
  const horizon = daysUntilExam ?? 14
  const effectiveDays = Math.min(periodDays, horizon)
  return Math.max(1, Math.min(3, Math.ceil(effectiveDays / 2)))
}

export function validateGeneratedGoals(
  drafts: GeneratedGoalDraft[],
  context: GoalGenerationContext
): GeneratedGoalDraft[] {
  const horizonDays = context.daysUntilExam ?? 14
  if (
    context.examTarget &&
    context.daysUntilExam !== null &&
    context.daysUntilExam <= 0
  ) {
    return []
  }

  const maxPeriodDays = Math.max(1, Math.min(14, horizonDays || 14))
  const maxChapterTarget = maxChaptersForPeriod(
    context.daysUntilExam,
    maxPeriodDays
  )
  const validChapterIds = new Set(
    context.syllabus.incompleteChapters.map((chapter) => chapter.id)
  )
  const validQuizIds = new Set(context.quizById.keys())
  const seenTitles = new Set<string>()
  const validated: GeneratedGoalDraft[] = []

  for (const draft of drafts) {
    const periodDays = Math.max(1, Math.min(draft.periodDays, maxPeriodDays))
    const titleKey = draft.title.trim().toLowerCase()
    if (seenTitles.has(titleKey)) continue
    seenTitles.add(titleKey)

    if (draft.type === "COMPLETE_CHAPTERS") {
      const chapterIds = (draft.metadata?.chapterIds ?? []).filter((id) =>
        validChapterIds.has(id)
      )
      if (chapterIds.length === 0) continue

      const targetCount = Math.max(
        1,
        Math.min(draft.targetCount, chapterIds.length, maxChapterTarget)
      )

      validated.push(
        enrichGoalDraft(
          {
            ...draft,
            periodDays,
            targetCount,
            metadata: { chapterIds: chapterIds.slice(0, targetCount) },
            href: context.chapterById.get(chapterIds[0]!)?.href,
          },
          context
        )
      )
      continue
    }

    if (draft.type === "REVISE_CHAPTER" || draft.type === "IMPROVE_WEAK_AREA") {
      const weak = context.performance.weakAreas[0]
      const chapterId = draft.metadata?.chapterIds?.[0]
      const chapter =
        (chapterId ? context.chapterById.get(chapterId) : null) ??
        (weak
          ? [...context.chapterById.values()].find(
              (item) => item.chapterSlug === weak.chapterSlug
            )
          : null)

      if (!chapter) continue

      validated.push(
        enrichGoalDraft(
          {
            ...draft,
            periodDays,
            targetCount: 1,
            title: draft.title.slice(0, 100),
            metadata: {
              chapterIds: [chapter.id],
              subjectSlug: chapter.subjectSlug,
              chapterSlug: chapter.chapterSlug,
              quizId: chapter.quizId ?? undefined,
              minQuizScore: 70,
            },
            href: chapter.href,
          },
          context
        )
      )
      continue
    }

    if (draft.type === "PASS_QUIZ") {
      const quizId = draft.metadata?.quizId
      if (!quizId || !validQuizIds.has(quizId)) continue
      const quiz = context.quizById.get(quizId)!
      const chapter = context.chapterById.get(quiz.chapterId)
      if (!chapter) continue

      validated.push(
        enrichGoalDraft(
          {
            ...draft,
            periodDays,
            targetCount: 1,
            metadata: {
              quizId,
              chapterIds: [quiz.chapterId],
              subjectSlug: chapter.subjectSlug,
              chapterSlug: chapter.chapterSlug,
              minQuizScore: Math.max(
                60,
                Math.min(draft.metadata?.minQuizScore ?? 70, 90)
              ),
            },
            href: quiz.href,
          },
          context
        )
      )
      continue
    }

    if (draft.type === "MAINTAIN_STREAK") {
      const currentStreak = context.performance.studyStreak
      const targetStreak = Math.max(
        currentStreak + 1,
        Math.min(draft.metadata?.targetStreak ?? currentStreak + 2, 7)
      )
      if (targetStreak > horizonDays + currentStreak) continue

      validated.push(
        enrichGoalDraft(
          {
            ...draft,
            periodDays,
            targetCount: targetStreak,
            metadata: { targetStreak },
            href: "/subjects",
          },
          context
        )
      )
    }
  }

  return validated.slice(0, 4)
}

export function buildRuleBasedGoals(
  context: GoalGenerationContext
): GeneratedGoalDraft[] {
  if (
    context.examTarget &&
    context.daysUntilExam !== null &&
    context.daysUntilExam <= 0
  ) {
    return []
  }

  const horizonDays = Math.max(1, Math.min(context.daysUntilExam ?? 7, 7))
  const goals: GeneratedGoalDraft[] = []
  const nextChapters = context.syllabus.nextChapters.slice(0, 2)

  if (nextChapters.length > 0) {
    goals.push({
      type: "COMPLETE_CHAPTERS",
      title: `Complete ${nextChapters.length} upcoming chapter${nextChapters.length === 1 ? "" : "s"}`,
      rationale: "Steady chapter completion keeps you on track for your exam.",
      targetCount: nextChapters.length,
      periodDays: horizonDays,
      priority: 90,
      metadata: { chapterIds: nextChapters.map((chapter) => chapter.id) },
      href: nextChapters[0]?.href,
    })
  }

  const weak = context.performance.weakAreas[0]
  if (weak) {
    const chapter = [...context.chapterById.values()].find(
      (item) => item.chapterSlug === weak.chapterSlug
    )
    if (chapter) {
      goals.push({
        type: "IMPROVE_WEAK_AREA",
        title: `Strengthen ${weak.chapterTitle}`,
        rationale: "Fixing weak spots gives the biggest exam score boost.",
        targetCount: 1,
        periodDays: horizonDays,
        priority: 85,
        metadata: {
          chapterIds: [chapter.id],
          subjectSlug: chapter.subjectSlug,
          chapterSlug: chapter.chapterSlug,
          quizId: chapter.quizId ?? undefined,
          minQuizScore: 70,
        },
        href: weak.quizId
          ? (context.quizById.get(weak.quizId)?.href ?? chapter.href)
          : chapter.href,
      })
    }
  }

  const quizChapter = nextChapters.find((chapter) => chapter.quizId)
  if (quizChapter?.quizId) {
    goals.push({
      type: "PASS_QUIZ",
      title: `Pass ${quizChapter.title} quiz`,
      rationale: "Quiz practice locks in concepts for exam day.",
      targetCount: 1,
      periodDays: horizonDays,
      priority: 75,
      metadata: {
        quizId: quizChapter.quizId,
        chapterIds: [quizChapter.id],
        minQuizScore: 70,
      },
      href: context.quizById.get(quizChapter.quizId)?.href,
    })
  }

  if (context.performance.studyStreak < 3) {
    goals.push({
      type: "MAINTAIN_STREAK",
      title: "Build a 3-day study streak",
      rationale: "Consistency builds long-term retention.",
      targetCount: 3,
      periodDays: Math.max(horizonDays, 3),
      priority: 60,
      metadata: { targetStreak: 3 },
      href: "/subjects",
    })
  }

  return goals.slice(0, 4)
}
