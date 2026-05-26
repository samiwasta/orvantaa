import type { LucideIcon } from "lucide-react"
import { BookA, Bot, LayoutDashboard, LineChart } from "lucide-react"

import { getChapterBySlug } from "@/features/subjects/model/chapter-data"
import { resolveNotePage } from "@/features/subjects/model/note-data"
import { resolveQuizPage } from "@/features/subjects/model/quiz-data"
import { getSubjectBySlug } from "@/features/subjects/model/subject-cards"

export type DashboardNavItemDefinition = {
  title: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItemDefinition[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Subjects", href: "/subjects", icon: BookA },
  { title: "Performance", href: "/performance", icon: LineChart },
  { title: "AI Tutor", href: "/ai-tutor", icon: Bot },
]

export function isDashboardNavPathActive(
  pathname: string,
  href: string
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function resolveDashboardPageTitle(pathname: string): string {
  const quizDetail = pathname.match(
    /^\/subjects\/([^/]+)\/([^/]+)\/quiz\/([^/]+)\/?$/
  )
  if (quizDetail?.[1] && quizDetail?.[2] && quizDetail?.[3]) {
    const resolved = resolveQuizPage(
      quizDetail[1],
      quizDetail[2],
      quizDetail[3]
    )
    if (resolved) return "Quiz"
  }

  const noteDetail = pathname.match(
    /^\/subjects\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\/?$/
  )
  if (
    noteDetail?.[1] &&
    noteDetail?.[2] &&
    noteDetail?.[3] &&
    noteDetail?.[4] &&
    noteDetail[3] !== "quiz"
  ) {
    const resolved = resolveNotePage(
      noteDetail[1],
      noteDetail[2],
      noteDetail[3],
      noteDetail[4]
    )
    if (resolved) return "Notes"
  }

  const chapterDetail = pathname.match(/^\/subjects\/([^/]+)\/([^/]+)\/?$/)
  if (chapterDetail?.[1] && chapterDetail?.[2]) {
    const chapter = getChapterBySlug(chapterDetail[1], chapterDetail[2])
    if (chapter) return "Chapters"
  }

  const subjectDetail = pathname.match(/^\/subjects\/([^/]+)\/?$/)
  if (subjectDetail?.[1] && getSubjectBySlug(subjectDetail[1])) {
    return "Chapters"
  }

  const match = dashboardNavItems.find((item) =>
    isDashboardNavPathActive(pathname, item.href)
  )
  return match?.title ?? "Orvantaa"
}
