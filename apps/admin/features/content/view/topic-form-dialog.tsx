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
  type ContentTopicItem,
  slugify,
  type TopicInput,
} from "../model/content-models"
import { createTopicAction, updateTopicAction } from "../server/topic-actions"

type TopicFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapterId: string
  topic?: ContentTopicItem | null
}

export function TopicFormDialog({
  open,
  onOpenChange,
  chapterId,
  topic,
}: TopicFormDialogProps) {
  const isEdit = Boolean(topic)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [string, TopicInput],
    undefined
  >(
    ((...args: unknown[]) =>
      isEdit
        ? updateTopicAction(args[0] as string, args[1] as TopicInput)
        : createTopicAction(args[0] as string, args[1] as TopicInput)) as never,
    {
      successMessage: isEdit ? "Topic updated" : "Topic created",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setTitle(topic?.title ?? "")
    setSlug(topic?.slug ?? "")
    setSlugEdited(Boolean(topic))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, topic])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const input: TopicInput = { title, slug }
    if (isEdit && topic) {
      run(topic.id, input)
    } else {
      run(chapterId, input)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit topic" : "Add topic"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this topic's title or slug."
              : "Add a topic to this chapter."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="topic-title" required>
              Title
            </FieldLabel>
            <Input
              id="topic-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Introduction to variables"
              autoFocus
            />
            <FieldError>{fieldErrors.title?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="topic-slug" required>
              Slug
            </FieldLabel>
            <Input
              id="topic-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              placeholder="e.g. intro-to-variables"
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
