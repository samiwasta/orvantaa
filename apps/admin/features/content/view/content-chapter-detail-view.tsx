"use client"

import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { contentHref } from "../model/content-nav"
import type { ContentChapterRef, ContentTopicItem } from "../model/content-models"
import type { ContentQuizListItem } from "../model/quiz-models"
import { ContentChapterQuizzesView } from "./content-chapter-quizzes-view"
import { ContentTopicsView } from "./content-topics-view"

type ContentChapterDetailViewProps = {
  chapterRef: ContentChapterRef
  topics: ContentTopicItem[]
  quizzes: ContentQuizListItem[]
  boardId: string
  classId: string
  subjectId: string
  chapterId: string
  initialTab: string
}

const MAIN_TABS = [
  { id: "topics", label: "Topics" },
  { id: "quizzes", label: "Quizzes" },
] as const

type ChapterTabId = (typeof MAIN_TABS)[number]["id"]

function chapterTabHref(
  boardId: string,
  classId: string,
  subjectId: string,
  chapterId: string,
  tab: ChapterTabId
) {
  const base = contentHref.chapter(boardId, classId, subjectId, chapterId)
  return `${base}?tab=${tab}`
}

export function ContentChapterDetailView({
  chapterRef,
  topics,
  quizzes,
  boardId,
  classId,
  subjectId,
  chapterId,
  initialTab,
}: ContentChapterDetailViewProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const tab: ChapterTabId =
    tabParam === "quizzes" || tabParam === "topics"
      ? tabParam
      : initialTab === "quizzes"
        ? "quizzes"
        : "topics"

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
      <div className="border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {chapterRef.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {chapterRef.subjectTitle} · Manage topics, notes, and quizzes for this
          chapter.
        </p>
      </div>

      <div className="border-b border-border/60 bg-muted/20">
        <nav className="flex min-w-0" aria-label="Chapter sections">
          {MAIN_TABS.map(({ id, label }) => {
            const active = tab === id
            return (
              <Link
                key={id}
                href={chapterTabHref(boardId, classId, subjectId, chapterId, id)}
                className={cn(
                  "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-5",
                  active
                    ? "border-[#6C5CE7] bg-white text-[#6C5CE7]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-5 sm:p-6">
        {tab === "topics" ? (
          <ContentTopicsView chapterRef={chapterRef} topics={topics} />
        ) : null}
        {tab === "quizzes" ? (
          <ContentChapterQuizzesView chapterRef={chapterRef} quizzes={quizzes} />
        ) : null}
      </div>
    </div>
  )
}
