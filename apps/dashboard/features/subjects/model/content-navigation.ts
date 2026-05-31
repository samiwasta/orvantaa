export function noteHref(
  subjectSlug: string,
  chapterSlugParam: string,
  topicSlug: string,
  noteId: string
) {
  return `/subjects/${subjectSlug}/${chapterSlugParam}/${topicSlug}/${noteId}`
}

export function topicFirstNoteHref(
  subjectSlug: string,
  chapterSlugParam: string,
  topicSlug: string,
  firstNoteId: string | null
) {
  if (!firstNoteId) return null
  return noteHref(subjectSlug, chapterSlugParam, topicSlug, firstNoteId)
}

export function quizHref(
  subjectSlug: string,
  chapterSlugParam: string,
  quizId: string
) {
  return `/subjects/${subjectSlug}/${chapterSlugParam}/quiz/${quizId}`
}
