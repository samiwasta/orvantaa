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
import { ArrowLeft, Plus, Save } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import { contentHref } from "../model/content-nav"
import type { ContentChapterRef } from "../model/content-models"
import {
  createEmptyQuestion,
  QUIZ_DIFFICULTIES,
  QUIZ_DIFFICULTY_LABELS,
  type QuizDifficulty,
  type QuizEditorData,
  type QuizQuestionDraft,
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

export function QuizEditorView({ chapterRef, initialQuiz }: QuizEditorViewProps) {
  const [title, setTitle] = useState(initialQuiz.title)
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(
    initialQuiz.difficulty
  )
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>(
    initialQuiz.questions.length > 0
      ? initialQuiz.questions
      : [createEmptyQuestion()]
  )

  const chapterHref = contentHref.chapter(
    chapterRef.boardId,
    chapterRef.classId,
    chapterRef.subjectId,
    chapterRef.id
  )

  const { run: runSave, pending, formError } = useActionRunner(saveQuizAction, {
    successMessage: "Quiz saved",
  })

  function handleSave() {
    runSave(initialQuiz.id, { title, difficulty, questions })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          className="w-fit rounded-xl text-muted-foreground hover:text-[#6C5CE7]"
          asChild
        >
          <Link href={chapterHref}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to chapter
          </Link>
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Save className="size-4" aria-hidden />
          {pending ? "Saving..." : "Save quiz"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="quiz-edit-title" required>
            Quiz title
          </FieldLabel>
          <Input
            id="quiz-edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel required>Difficulty</FieldLabel>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as QuizDifficulty)}
          >
            <SelectTrigger>
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
      </div>

      {formError ? (
        <p className="text-sm font-medium text-destructive">{formError}</p>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Questions
          </h2>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => setQuestions([...questions, createEmptyQuestion()])}
          >
            <Plus className="size-4" aria-hidden />
            Add question
          </Button>
        </div>

        {questions.map((question, index) => (
          <QuizQuestionEditor
            key={index}
            question={question}
            index={index}
            total={questions.length}
            onChange={(next) =>
              setQuestions(questions.map((q, i) => (i === index ? next : q)))
            }
            onMoveUp={() => setQuestions(moveQuestion(questions, index, -1))}
            onMoveDown={() => setQuestions(moveQuestion(questions, index, 1))}
            onRemove={() =>
              setQuestions(questions.filter((_, i) => i !== index))
            }
          />
        ))}
      </div>
    </div>
  )
}
