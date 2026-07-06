import type {
  GoalChapterContext,
  GoalGenerationContext,
} from "../repository/goal-context.repository"
import type {
  GeneratedGoalDraft,
  StudentGoal,
  StudentGoalMetadata,
} from "./student-goal"

export type GoalChapterTarget = {
  chapterId: string
  subjectTitle: string
  chapterTitle: string
  subjectSlug: string
  chapterSlug: string
  href: string
}

export function goalProgressPercent(
  goal: Pick<StudentGoal, "progressCount" | "targetCount">
) {
  if (goal.targetCount <= 0) return 0
  return Math.min(
    100,
    Math.round((goal.progressCount / goal.targetCount) * 100)
  )
}

function chapterLabel(
  target: Pick<GoalChapterTarget, "subjectTitle" | "chapterTitle">
) {
  return `${target.chapterTitle} · ${target.subjectTitle}`
}

function resolveChapterTargets(
  chapterIds: string[],
  context: GoalGenerationContext
): GoalChapterTarget[] {
  return chapterIds
    .map((chapterId) => context.chapterById.get(chapterId))
    .filter((chapter): chapter is GoalChapterContext => Boolean(chapter))
    .map((chapter) => ({
      chapterId: chapter.id,
      subjectTitle: chapter.subjectTitle,
      chapterTitle: chapter.title,
      subjectSlug: chapter.subjectSlug,
      chapterSlug: chapter.chapterSlug,
      href: chapter.href,
    }))
}

function joinTargets(targets: GoalChapterTarget[]) {
  if (targets.length === 0) return ""
  if (targets.length === 1) return chapterLabel(targets[0]!)
  if (targets.length === 2) {
    return `${chapterLabel(targets[0]!)} and ${chapterLabel(targets[1]!)}`
  }
  const head = targets.slice(0, -1).map(chapterLabel).join(", ")
  return `${head}, and ${chapterLabel(targets[targets.length - 1]!)}`
}

export function enrichGoalDraft(
  draft: GeneratedGoalDraft,
  context: GoalGenerationContext
): GeneratedGoalDraft {
  if (draft.type === "COMPLETE_CHAPTERS") {
    const chapterIds = draft.metadata?.chapterIds ?? []
    const targets = resolveChapterTargets(chapterIds, context)
    if (targets.length === 0) return draft

    const instruction =
      targets.length === 1
        ? `Finish all notes and the chapter quiz for ${chapterLabel(targets[0]!)}.`
        : `Finish notes and quizzes for ${joinTargets(targets)}.`

    return {
      ...draft,
      title:
        targets.length === 1
          ? `Complete ${targets[0]!.chapterTitle} · ${targets[0]!.subjectTitle}`
          : `Complete ${targets.length} chapters across your syllabus`,
      description: instruction,
      rationale:
        draft.rationale ??
        "Each finished chapter moves you closer to full syllabus coverage before your exam.",
      href: targets[0]?.href ?? draft.href,
      metadata: {
        ...draft.metadata,
        chapterIds: targets.map((target) => target.chapterId),
        targets,
        instruction,
      },
    }
  }

  if (draft.type === "REVISE_CHAPTER" || draft.type === "IMPROVE_WEAK_AREA") {
    const chapterId = draft.metadata?.chapterIds?.[0]
    const chapter = chapterId ? context.chapterById.get(chapterId) : null
    if (!chapter) return draft

    const weak = context.performance.weakAreas.find(
      (area) => area.chapterSlug === chapter.chapterSlug
    )
    const minScore = draft.metadata?.minQuizScore ?? 70
    const instruction = chapter.quizId
      ? `Revisit ${chapter.title} in ${chapter.subjectTitle} and score ${minScore}%+ on its quiz.`
      : `Revisit all notes in ${chapter.title} · ${chapter.subjectTitle}.`

    return {
      ...draft,
      title:
        draft.type === "IMPROVE_WEAK_AREA"
          ? `Strengthen ${chapter.title} · ${chapter.subjectTitle}`
          : `Revise ${chapter.title} · ${chapter.subjectTitle}`,
      description: weak
        ? `Your recent average in this chapter is ${weak.averageScore}%. ${instruction}`
        : instruction,
      rationale:
        draft.rationale ??
        "Turning weak chapters into strengths has the biggest impact on exam marks.",
      href: chapter.quizId
        ? (context.quizById.get(chapter.quizId)?.href ?? chapter.href)
        : chapter.href,
      metadata: {
        ...draft.metadata,
        chapterIds: [chapter.id],
        subjectTitle: chapter.subjectTitle,
        chapterTitle: chapter.title,
        subjectSlug: chapter.subjectSlug,
        chapterSlug: chapter.chapterSlug,
        quizId: chapter.quizId ?? undefined,
        minQuizScore: minScore,
        targets: [
          {
            chapterId: chapter.id,
            subjectTitle: chapter.subjectTitle,
            chapterTitle: chapter.title,
            subjectSlug: chapter.subjectSlug,
            chapterSlug: chapter.chapterSlug,
            href: chapter.href,
          },
        ],
        instruction,
      },
    }
  }

  if (draft.type === "PASS_QUIZ") {
    const quizId = draft.metadata?.quizId
    if (!quizId) return draft
    const quiz = context.quizById.get(quizId)
    const chapter = quiz ? context.chapterById.get(quiz.chapterId) : null
    if (!quiz || !chapter) return draft

    const minScore = draft.metadata?.minQuizScore ?? 70
    const instruction = `Take the ${chapter.title} quiz in ${chapter.subjectTitle} and score at least ${minScore}%.`

    return {
      ...draft,
      title: `Score ${minScore}%+ on ${chapter.title} quiz`,
      description: instruction,
      rationale:
        draft.rationale ??
        "Chapter quizzes mirror exam-style questions and show what still needs revision.",
      href: quiz.href,
      metadata: {
        ...draft.metadata,
        quizId,
        chapterIds: [chapter.id],
        subjectTitle: chapter.subjectTitle,
        chapterTitle: chapter.title,
        subjectSlug: chapter.subjectSlug,
        chapterSlug: chapter.chapterSlug,
        minQuizScore: minScore,
        targets: [
          {
            chapterId: chapter.id,
            subjectTitle: chapter.subjectTitle,
            chapterTitle: chapter.title,
            subjectSlug: chapter.subjectSlug,
            chapterSlug: chapter.chapterSlug,
            href: quiz.href,
          },
        ],
        instruction,
      },
    }
  }

  if (draft.type === "MAINTAIN_STREAK") {
    const targetStreak = draft.metadata?.targetStreak ?? draft.targetCount
    const instruction = `Study any subject for ${targetStreak} consecutive days — even 15 minutes counts.`

    return {
      ...draft,
      title: `Study ${targetStreak} days in a row`,
      description: instruction,
      rationale:
        draft.rationale ??
        "Daily consistency beats cramming and keeps every subject fresh before the exam.",
      href: "/subjects",
      metadata: {
        ...draft.metadata,
        targetStreak,
        instruction,
      },
    }
  }

  return draft
}

export function enrichGoalDrafts(
  drafts: GeneratedGoalDraft[],
  context: GoalGenerationContext
) {
  return drafts.map((draft) => enrichGoalDraft(draft, context))
}

export function hydrateGoalMetadata(
  goal: StudentGoal,
  context: GoalGenerationContext
): StudentGoalMetadata | null {
  const metadata = goal.metadata
  if (metadata?.instruction && metadata.targets?.length) {
    return metadata
  }

  const enriched = enrichGoalDraft(
    {
      type: goal.type,
      title: goal.title,
      description: goal.description ?? undefined,
      rationale: goal.rationale ?? undefined,
      targetCount: goal.targetCount,
      periodDays: 1,
      href: goal.href ?? undefined,
      metadata: metadata ?? undefined,
    },
    context
  )

  return enriched.metadata ?? metadata
}

export function getGoalSubtitle(metadata: StudentGoalMetadata | null) {
  if (!metadata) return null
  if (metadata.instruction) return metadata.instruction

  if (metadata.targets?.length) {
    const first = metadata.targets[0]!
    if (metadata.targets.length === 1) {
      return `${first.chapterTitle} · ${first.subjectTitle}`
    }
    return metadata.targets
      .map((target) => `${target.chapterTitle} · ${target.subjectTitle}`)
      .join(" · ")
  }

  if (metadata.chapterTitle && metadata.subjectTitle) {
    return `${metadata.chapterTitle} · ${metadata.subjectTitle}`
  }

  return null
}

export function getGoalActionLabel(type: StudentGoal["type"]) {
  switch (type) {
    case "COMPLETE_CHAPTERS":
      return "Complete chapter"
    case "PASS_QUIZ":
      return "Take quiz"
    case "IMPROVE_WEAK_AREA":
      return "Strengthen"
    case "REVISE_CHAPTER":
      return "Revise"
    case "MAINTAIN_STREAK":
      return "Keep streak"
    default:
      return "Continue"
  }
}
