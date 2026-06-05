"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowLeft, ClipboardList, Plus, Save } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import { contentHref } from "../model/content-nav"
import type { ContentChapterRef } from "../model/content-models"
import {
  createEmptyQuestion,
  minutesToSeconds,
  QUIZ_DIFFICULTIES,
  QUIZ_DIFFICULTY_LABELS,
  secondsToMinutes,
  type QuizDifficulty,
  type QuizEditorData,
  type QuizQuestionDraft,
  type QuizTimedMode,
} from "../model/quiz-models"
import { saveQuizAction } from "../server/quiz-actions"
import { QuizQuestionEditor } from "./quiz-question-editor"

type QuizEditorViewProps = {
  chapterRef: ContentChapterRef
  initialQuiz: QuizEditorData
}

function moveQuestion(
  questions: QuizQuestionDraft[],
  index: number,
  direction: -1 | 1
): QuizQuestionDraft[] {
  const next = index + direction
  if (next < 0 || next >= questions.length) return questions
  const copy = [...questions]
  const temp = copy[index]!
  copy[index] = copy[next]!
  copy[next] = temp
  return copy
}

function ChoicePill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7] shadow-sm"
          : "border-border/70 bg-white text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export function QuizEditorView({ chapterRef, initialQuiz }: QuizEditorViewProps) {
  const [title, setTitle] = useState(initialQuiz.title)
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(
    initialQuiz.difficulty
  )
  const [timedMode, setTimedMode] = useState<QuizTimedMode>(
    initialQuiz.timedMode
  )
  const [timeMinutes, setTimeMinutes] = useState(
    secondsToMinutes(initialQuiz.timeLimitSeconds)
  )
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>(
    initialQuiz.questions.length > 0
      ? initialQuiz.questions
      : [createEmptyQuestion()]
  )
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(0)

  const isTimed = timedMode !== "untimed"
  const chapterHref = contentHref.chapter(
    chapterRef.boardId,
    chapterRef.classId,
    chapterRef.subjectId,
    chapterRef.id
  )

  const { run: runSave, pending, formError } = useActionRunner(saveQuizAction, {
    successMessage: "Quiz saved",
  })

  useEffect(() => {
    if (expandedQuestionIndex >= questions.length) {
      setExpandedQuestionIndex(Math.max(0, questions.length - 1))
    }
  }, [questions.length, expandedQuestionIndex])

  function handleMoveQuestion(index: number, direction: -1 | 1) {
    const next = moveQuestion(questions, index, direction)
    const swapWith = index + direction
    setQuestions(next)
    if (expandedQuestionIndex === index) {
      setExpandedQuestionIndex(swapWith)
    } else if (expandedQuestionIndex === swapWith) {
      setExpandedQuestionIndex(index)
    }
  }

  function handleRemoveQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
    if (expandedQuestionIndex > index) {
      setExpandedQuestionIndex(expandedQuestionIndex - 1)
    } else if (expandedQuestionIndex === index) {
      setExpandedQuestionIndex(Math.max(0, index - 1))
    }
  }

  function handleSave() {
    runSave(initialQuiz.id, {
      title,
      difficulty,
      timedMode,
      timeLimitSeconds: isTimed ? minutesToSeconds(timeMinutes) : null,
      questions,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-xl text-muted-foreground hover:text-[#6C5CE7]"
              asChild
            >
              <Link href={chapterHref} aria-label="Back to chapter">
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7]">
                  <ClipboardList className="size-4" aria-hidden />
                </span>
                <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Edit quiz
                </h1>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {chapterRef.title} · {chapterRef.subjectTitle}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="h-10 shrink-0 rounded-xl bg-[#6C5CE7] px-5 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Save className="size-4" aria-hidden />
            {pending ? "Saving..." : "Save quiz"}
          </Button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <section className="space-y-3">
            <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-12">
              <Field className="lg:col-span-5">
                <FieldLabel htmlFor="quiz-edit-title" required>
                  Quiz title
                </FieldLabel>
                <Input
                  id="quiz-edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 rounded-xl border-border/60 bg-white"
                />
              </Field>
              <Field className="lg:col-span-3">
                <FieldLabel required>Difficulty</FieldLabel>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as QuizDifficulty)}
                >
                  <SelectTrigger className="h-10 rounded-xl border-border/60 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUIZ_DIFFICULTIES.map((level) => (
                      <SelectItem key={level} value={level}>
                        {QUIZ_DIFFICULTY_LABELS[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field className="lg:col-span-4">
                <FieldLabel>Timing</FieldLabel>
                <div className="flex h-10 items-center gap-2">
                  <ChoicePill
                    active={!isTimed}
                    onClick={() => setTimedMode("untimed")}
                  >
                    Untimed
                  </ChoicePill>
                  <ChoicePill
                    active={isTimed}
                    onClick={() =>
                      setTimedMode(
                        timedMode === "untimed" ? "per_question" : timedMode
                      )
                    }
                  >
                    Timed
                  </ChoicePill>
                </div>
              </Field>
            </div>

            {isTimed ? (
              <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/50 bg-muted/10 px-3 py-3">
                <Field className="min-w-0">
                  <FieldLabel className="text-xs">Applies to</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    <ChoicePill
                      active={timedMode === "per_question"}
                      onClick={() => setTimedMode("per_question")}
                    >
                      Each question
                    </ChoicePill>
                    <ChoicePill
                      active={timedMode === "whole_quiz"}
                      onClick={() => setTimedMode("whole_quiz")}
                    >
                      Whole quiz
                    </ChoicePill>
                  </div>
                </Field>
                <Field className="shrink-0">
                  <FieldLabel htmlFor="quiz-time-minutes" className="text-xs">
                    {timedMode === "per_question" ? "Per question" : "Total time"}
                  </FieldLabel>
                  <div className="flex h-10 items-center gap-2">
                    <Input
                      id="quiz-time-minutes"
                      type="number"
                      min={1}
                      max={180}
                      value={timeMinutes}
                      onChange={(e) =>
                        setTimeMinutes(
                          Math.max(1, Number.parseInt(e.target.value, 10) || 1)
                        )
                      }
                      className="h-10 w-20 rounded-xl border-border/60 bg-white"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </Field>
              </div>
            ) : null}
          </section>

          {formError ? (
            <p className="text-sm font-medium text-destructive">{formError}</p>
          ) : null}

          <section className="space-y-4">
            <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Questions
                </h2>
                <p className="text-xs text-muted-foreground">
                  {questions.length} question
                  {questions.length === 1 ? "" : "s"} · expand one to edit
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-xl"
                onClick={() => {
                  const nextIndex = questions.length
                  setQuestions([...questions, createEmptyQuestion()])
                  setExpandedQuestionIndex(nextIndex)
                }}
              >
                <Plus className="size-4" aria-hidden />
                Add question
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {questions.map((question, index) => (
                <QuizQuestionEditor
                  key={index}
                  question={question}
                  index={index}
                  total={questions.length}
                  expanded={expandedQuestionIndex === index}
                  onToggle={() => setExpandedQuestionIndex(index)}
                  onChange={(next) =>
                    setQuestions(questions.map((q, i) => (i === index ? next : q)))
                  }
                  onMoveUp={() => handleMoveQuestion(index, -1)}
                  onMoveDown={() => handleMoveQuestion(index, 1)}
                  onRemove={() => handleRemoveQuestion(index)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
