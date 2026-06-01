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
import Image from "next/image"
import { useEffect, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import {
  type ContentSubjectItem,
  slugify,
  type SubjectInput,
} from "../model/content-models"
import { createSubjectAction, updateSubjectAction } from "../server/subject-actions"

type SubjectFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  subject?: ContentSubjectItem | null
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  classId,
  subject,
}: SubjectFormDialogProps) {
  const isEdit = Boolean(subject)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [string, SubjectInput],
    undefined
  >(
    ((...args: unknown[]) =>
      isEdit
        ? updateSubjectAction(args[0] as string, args[1] as SubjectInput)
        : createSubjectAction(args[0] as string, args[1] as SubjectInput)) as never,
    {
      successMessage: isEdit ? "Subject updated" : "Subject created",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setUploadError(null)
    setTitle(subject?.title ?? "")
    setSlug(subject?.slug ?? "")
    setSlugEdited(Boolean(subject))
    setImageUrl(subject?.imageUrl ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subject])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  async function handleThumbnailChange(file: File | null) {
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const response = await fetch("/api/uploads/subject-thumbnail", {
        method: "POST",
        body,
      })
      const data = (await response.json()) as { url?: string; message?: string }
      if (!response.ok || !data.url) {
        setUploadError(data.message ?? "Upload failed.")
        return
      }
      setImageUrl(data.url)
    } catch {
      setUploadError("Could not upload the image.")
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const input: SubjectInput = {
      title,
      slug,
      imageUrl: imageUrl ?? null,
    }
    if (isEdit && subject) {
      run(subject.id, input)
    } else {
      run(classId, input)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subject" : "Add subject"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this subject's details or thumbnail."
              : "Add a subject with an optional thumbnail for the student app."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="subject-title" required>
              Title
            </FieldLabel>
            <Input
              id="subject-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Mathematics"
              autoFocus
            />
            <FieldError>{fieldErrors.title?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="subject-slug" required>
              Slug
            </FieldLabel>
            <Input
              id="subject-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              placeholder="e.g. mathematics"
            />
            <FieldHint>Used in the student app URLs.</FieldHint>
            <FieldError>{fieldErrors.slug?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="subject-thumbnail">Thumbnail</FieldLabel>
            {imageUrl ? (
              <div className="relative h-32 w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 text-xs text-muted-foreground">
                No thumbnail yet
              </div>
            )}
            <Input
              id="subject-thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading || pending}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                void handleThumbnailChange(file)
                e.target.value = ""
              }}
            />
            <FieldHint>JPEG, PNG, WebP, or GIF up to 2 MB.</FieldHint>
            {uploadError ? (
              <p className="text-sm font-medium text-destructive">{uploadError}</p>
            ) : null}
            <FieldError>{fieldErrors.imageUrl?.[0]}</FieldError>
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
              disabled={pending || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
              disabled={pending || uploading}
            >
              {pending || uploading
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
