import type { Metadata } from "next"

export const STUDENT_SITE_TITLE = "Orvantaa"

export function createStudentPageMetadata(
  pageTitle: string,
  description: string
): Metadata {
  return {
    title: `${pageTitle} - ${STUDENT_SITE_TITLE}`,
    description,
  }
}

export const subjectsPageMetadata = createStudentPageMetadata(
  "Subjects",
  "Browse your class subjects, track chapter progress, and continue learning."
)

export function subjectChaptersPageMetadata(subjectTitle: string): Metadata {
  return createStudentPageMetadata(
    subjectTitle,
    `View chapters and track your progress in ${subjectTitle}.`
  )
}

export function chapterDetailPageMetadata(
  chapterTitle: string,
  subjectTitle?: string
): Metadata {
  const context = subjectTitle ? ` in ${subjectTitle}` : ""
  return createStudentPageMetadata(
    chapterTitle,
    `Study topics, notes, and quizzes for ${chapterTitle}${context}.`
  )
}

export function notePageMetadata(
  noteTitle: string,
  topicTitle?: string
): Metadata {
  const context = topicTitle ? ` from ${topicTitle}` : ""
  return createStudentPageMetadata(
    noteTitle,
    `Read lesson notes for ${noteTitle}${context}.`
  )
}

export function quizPageMetadata(
  quizTitle: string,
  chapterTitle?: string
): Metadata {
  const context = chapterTitle ? ` in ${chapterTitle}` : ""
  return createStudentPageMetadata(
    quizTitle,
    `Take the ${quizTitle} quiz${context} and test your understanding.`
  )
}

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
