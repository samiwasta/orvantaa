"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowLeft, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import type { ChapterItem } from "../model/chapter-data"
import { chapterSlug } from "../model/chapter-data"
import type { QuizSession } from "../model/quiz-data"
import { optionDisplayLabel } from "../model/quiz-data"
import { NoteAiTutorCard } from "./note-ai-tutor-card"
import { NoteAiTutorFab } from "./note-ai-tutor-fab"

function QuizProgressStrip({
  current,
  total,
}: {
  current: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-[#6C5CE7] transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

type QuizViewProps = {
  subjectSlug: string
  chapter: ChapterItem
  session: QuizSession
}

export function QuizView({ subjectSlug, chapter, session }: QuizViewProps) {
  const router = useRouter()
  const chSlug = chapterSlug(chapter)
  const chapterHref = `/subjects/${subjectSlug}/${chSlug}`
  const { quiz, questions } = session

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [aiTutorOpen, setAiTutorOpen] = useState(false)

  const question = questions[currentIndex]
  const questionNumber = currentIndex + 1
  const totalQuestions = questions.length
  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalQuestions - 1

  if (!question) {
    return (
      <div className="w-full">
        <Link
          href={chapterHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to Chapter
        </Link>
        <p className="mt-6 text-sm text-muted-foreground">
          No questions available for this quiz.
        </p>
      </div>
    )
  }

  const handlePrevious = () => {
    if (isFirst) return
    setCurrentIndex((i) => i - 1)
    setSelectedOptionId(null)
  }

  const handleSubmit = () => {
    if (!selectedOptionId) return
    if (isLast) {
      router.push(chapterHref)
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedOptionId(null)
  }

  const tutorContext = `${quiz.title} — Question ${questionNumber}`

  return (
    <div className="w-full">
      <div>
        <Link
          href={chapterHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to Chapter
        </Link>

        <div className="mt-2">
          <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-[#6C5CE7] md:px-2.5 md:text-xs">
            {quiz.title}
          </span>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground md:mt-1.5 md:text-2xl lg:text-3xl">
            Chapter {chapter.number}: {chapter.title}
          </h1>
        </div>
      </div>

      <div
        className={cn(
          "mt-5",
          aiTutorOpen &&
            "grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start xl:gap-6"
        )}
      >
        <div className="min-w-0 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Question {questionNumber} of {totalQuestions}
            </p>
            <div className="mt-2">
              <QuizProgressStrip
                current={questionNumber}
                total={totalQuestions}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-base leading-snug font-semibold text-foreground sm:text-lg">
              {questionNumber}. {question.question}
            </h2>

            <div
              className="mt-5 space-y-3"
              role="radiogroup"
              aria-label="Answer choices"
            >
              {question.options.map((option) => {
                const selected = selectedOptionId === option.id
                const letter = optionDisplayLabel(option.id)

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all",
                      "bg-violet-50/80 ring-1 ring-violet-100/80",
                      "hover:bg-violet-100/70",
                      selected &&
                        "bg-violet-100 shadow-sm ring-2 shadow-violet-200/40 ring-[#6C5CE7]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white",
                        selected ? "bg-[#6C5CE7]" : "bg-[#6C5CE7]/90"
                      )}
                    >
                      {letter}
                    </span>
                    <span className="text-sm font-medium text-foreground sm:text-[15px]">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirst}
                className="h-10 gap-1 rounded-xl border-border bg-background px-4 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedOptionId}
                className="h-10 rounded-xl bg-[#FF8A3D] px-6 text-sm font-semibold text-white shadow-md shadow-orange-200/50 hover:bg-[#E8722A] active:bg-[#D96A20] disabled:opacity-50"
              >
                {isLast ? "Finish Quiz" : "Submit Answer"}
              </Button>
            </div>
          </div>
        </div>

        {aiTutorOpen ? (
          <aside className="hidden min-w-0 xl:sticky xl:top-6 xl:block xl:self-start">
            <NoteAiTutorCard
              lessonTitle={tutorContext}
              onClose={() => setAiTutorOpen(false)}
            />
          </aside>
        ) : null}
      </div>

      <NoteAiTutorFab
        open={aiTutorOpen}
        onOpenChange={setAiTutorOpen}
        lessonTitle={tutorContext}
      />
    </div>
  )
}
