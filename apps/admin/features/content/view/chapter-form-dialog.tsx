"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useEffect, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import {
  type ChapterInput,
  type ContentChapterItem,
  slugify,
} from "../model/content-models"
import { createChapterAction, updateChapterAction } from "../server/chapter-actions"

type ChapterFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  chapter?: ContentChapterItem | null
}

export function ChapterFormDialog({
  open,
  onOpenChange,
  subjectId,
  chapter,
}: ChapterFormDialogProps) {
  const isEdit = Boolean(chapter)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [string, ChapterInput],
    undefined
  >(
    ((...args: unknown[]) =>
      isEdit
        ? updateChapterAction(args[0] as string, args[1] as ChapterInput)
        : createChapterAction(args[0] as string, args[1] as ChapterInput)) as never,
    {
      successMessage: isEdit ? "Chapter updated" : "Chapter created",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setTitle(chapter?.title ?? "")
    setSlug(chapter?.slug ?? "")
    setSlugEdited(Boolean(chapter))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, chapter])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const input: ChapterInput = { title, slug }
    if (isEdit && chapter) {
      run(chapter.id, input)
    } else {
      run(subjectId, input)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit chapter" : "Add chapter"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this chapter's title or slug."
              : "Add a chapter to this subject."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="chapter-title" required>
              Title
            </FieldLabel>
            <Input
              id="chapter-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Linear Equations"
              autoFocus
            />
            <FieldError>{fieldErrors.title?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="chapter-slug" required>
              Slug
            </FieldLabel>
            <Input
              id="chapter-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              placeholder="e.g. linear-equations"
            />
            <FieldHint>Used in the student app URLs.</FieldHint>
            <FieldError>{fieldErrors.slug?.[0]}</FieldError>
          </Field>

          {formError ? (
            <p className="text-sm font-medium text-destructive">{formError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
              disabled={pending}
            >
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
