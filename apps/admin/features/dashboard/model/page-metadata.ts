import type { Metadata } from "next"

export const ADMIN_SITE_TITLE = "Orvantaa Admin"

export function createAdminPageMetadata(
  pageTitle: string,
  description: string
): Metadata {
  return {
    title: `${pageTitle} - ${ADMIN_SITE_TITLE}`,
    description,
  }
}

export const dashboardPageMetadata = createAdminPageMetadata(
  "Dashboard",
  "Platform overview with schools, students, signups, and quick actions."
)

export const contentPageMetadata = createAdminPageMetadata(
  "Content",
  "Manage boards, subjects, chapters, study notes, and quizzes."
)

export const schoolsPageMetadata = createAdminPageMetadata(
  "Schools",
  "View and manage registered schools, students, and subscriptions."
)

export const classesPageMetadata = createAdminPageMetadata(
  "Classes",
  "Configure grade levels, sections, and class structure."
)

export const boardsPageMetadata = createAdminPageMetadata(
  "Boards",
  "Create and manage education boards and universities."
)

export const managementPageMetadata = createAdminPageMetadata(
  "Management",
  "Manage the admin team, platform settings, and subscription billing."
)

export const queriesPageMetadata = createAdminPageMetadata(
  "Queries",
  "Review and respond to student support tickets."
)

export const profilePageMetadata = createAdminPageMetadata(
  "My Profile",
  "View and update your admin account details and password."
)

export function contentBoardPageMetadata(boardName: string): Metadata {
  return createAdminPageMetadata(
    boardName,
    `Browse classes and subjects for ${boardName}.`
  )
}

export function contentClassPageMetadata(className: string): Metadata {
  return createAdminPageMetadata(
    className,
    `Manage subjects and learning content for ${className}.`
  )
}

export function contentSubjectPageMetadata(subjectTitle: string): Metadata {
  return createAdminPageMetadata(
    subjectTitle,
    `Organize chapters, topics, notes, and quizzes for ${subjectTitle}.`
  )
}

export function contentChapterPageMetadata(chapterTitle: string): Metadata {
  return createAdminPageMetadata(
    chapterTitle,
    `Manage topics, notes, and quizzes in ${chapterTitle}.`
  )
}

export function contentTopicPageMetadata(topicTitle: string): Metadata {
  return createAdminPageMetadata(
    topicTitle,
    `Edit study notes and learning materials for ${topicTitle}.`
  )
}

export function contentNotePageMetadata(noteTitle: string): Metadata {
  return createAdminPageMetadata(
    noteTitle,
    `Edit study note content for ${noteTitle}.`
  )
}

export function contentQuizPageMetadata(quizTitle: string): Metadata {
  return createAdminPageMetadata(
    quizTitle,
    `Edit quiz questions and settings for ${quizTitle}.`
  )
}

export function schoolDetailPageMetadata(
  schoolName: string,
  schoolCode: string
): Metadata {
  return createAdminPageMetadata(
    schoolName,
    `Manage students, classes, syllabus, and subscription for ${schoolCode}.`
  )
}

export function queryDetailPageMetadata(ticketNumber: string): Metadata {
  return createAdminPageMetadata(
    ticketNumber,
    `View and update student support ticket ${ticketNumber}.`
  )
}
