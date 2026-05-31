"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  ChevronRight,
  ClipboardList,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import { contentHref } from "../model/content-nav"
import type { ContentChapterRef } from "../model/content-models"
import {
  QUIZ_DIFFICULTIES,
  QUIZ_DIFFICULTY_LABELS,
  type ContentQuizListItem,
  type QuizCreateInput,
  type QuizDifficulty,
} from "../model/quiz-models"
import { createQuizAction, deleteQuizAction } from "../server/quiz-actions"

type ContentChapterQuizzesViewProps = {
  chapterRef: ContentChapterRef
  quizzes: ContentQuizListItem[]
}

export function ContentChapterQuizzesView({
  chapterRef,
  quizzes,
}: ContentChapterQuizzesViewProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium")
  const [deleteTarget, setDeleteTarget] = useState<ContentQuizListItem | null>(
    null
  )

  const { run: runCreate, pending: creating, fieldErrors, formError, reset } =
    useActionRunner(createQuizAction, {
      successMessage: "Quiz created",
      onSuccess: (data) => {
        setCreateOpen(false)
        router.push(
          contentHref.quiz(
            chapterRef.schoolId,
            chapterRef.classId,
            chapterRef.subjectId,
            chapterRef.id,
            data.id
          )
        )
      },
    })

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteQuizAction,
    { successMessage: "Quiz deleted", onSuccess: () => setDeleteTarget(null) }
  )

  function openCreate() {
    reset()
    setTitle("")
    setDifficulty("medium")
    setCreateOpen(true)
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const input: QuizCreateInput = { title, difficulty }
    runCreate(chapterRef.id, input)
  }

  return (
    <div className="flex flex-col gap-4 border-t border-border/60 pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Quizzes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            MCQ quizzes for this chapter. Students take them after reading notes.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <ClipboardList className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground">No quizzes yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a quiz with multiple-choice questions and explanations.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-sm ring-1 ring-black/[0.04] transition-all hover:border-[#6C5CE7]/35 hover:shadow-md"
            >
              <Link
                href={contentHref.quiz(
                  chapterRef.schoolId,
                  chapterRef.classId,
                  chapterRef.subjectId,
                  chapterRef.id,
                  quiz.id
                )}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#b4720a]">
                  <ClipboardList className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {quiz.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {quiz.questionCount} question
                    {quiz.questionCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge
                  variant={
                    quiz.difficulty === "easy"
                      ? "success"
                      : quiz.difficulty === "hard"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {quiz.difficultyLabel}
                </Badge>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label={`Actions for ${quiz.title}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={contentHref.quiz(
                        chapterRef.schoolId,
                        chapterRef.classId,
                        chapterRef.subjectId,
                        chapterRef.id,
                        quiz.id
                      )}
                    >
                      <Pencil className="size-4" aria-hidden />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(quiz)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground/30"
                aria-hidden
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add quiz</DialogTitle>
            <DialogDescription>
              Name this quiz and set difficulty. You will add questions on the
              next screen.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="quiz-title" required>
                Title
              </FieldLabel>
              <Input
                id="quiz-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Linear Equations Basics"
                autoFocus
              />
              <FieldError>{fieldErrors.title?.[0]}</FieldError>
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
              <FieldError>{fieldErrors.difficulty?.[0]}</FieldError>
            </Field>
            {formError ? (
              <p className="text-sm font-medium text-destructive">{formError}</p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create and edit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete quiz"
        description={
          deleteTarget
            ? `This permanently deletes "${deleteTarget.title}" and all its questions. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        pending={deletePending}
        onConfirm={() => {
          if (deleteTarget) runDelete(deleteTarget.id)
        }}
      />
    </div>
  )
}
