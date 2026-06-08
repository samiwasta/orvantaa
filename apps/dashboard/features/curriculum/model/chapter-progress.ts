export type ChapterProgressInput = {
  topics: Array<{ notes: Array<{ id: string }> }>
  quizzes: Array<{ id: string }>
}

export type ChapterProgressResult = {
  completedNotes: number
  totalNotes: number
  completedQuizzes: number
  totalQuizzes: number
  completedItems: number
  totalItems: number
  progressPercent: number
  isCompleted: boolean
  hasProgress: boolean
}

export function resolveChapterProgress(
  chapter: ChapterProgressInput,
  noteProgress: Map<string, "VIEWED" | "COMPLETED">,
  completedQuizIds: Set<string>
): ChapterProgressResult {
  const noteIds = chapter.topics.flatMap((topic) =>
    topic.notes.map((note) => note.id)
  )
  const completedNotes = noteIds.filter(
    (noteId) => noteProgress.get(noteId) === "COMPLETED"
  ).length
  const completedQuizzes = chapter.quizzes.filter((quiz) =>
    completedQuizIds.has(quiz.id)
  ).length
  const totalNotes = noteIds.length
  const totalQuizzes = chapter.quizzes.length
  const totalItems = totalNotes + totalQuizzes
  const completedItems = completedNotes + completedQuizzes

  return {
    completedNotes,
    totalNotes,
    completedQuizzes,
    totalQuizzes,
    completedItems,
    totalItems,
    progressPercent:
      totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100),
    isCompleted: totalItems > 0 && completedItems === totalItems,
    hasProgress: completedItems > 0,
  }
}

export function countCompletedChapters(
  chapters: ChapterProgressInput[],
  noteProgress: Map<string, "VIEWED" | "COMPLETED">,
  completedQuizIds: Set<string>
): { completed: number; total: number } {
  const total = chapters.length
  const completed = chapters.filter(
    (chapter) =>
      resolveChapterProgress(chapter, noteProgress, completedQuizIds)
        .isCompleted
  ).length

  return { completed, total }
}
