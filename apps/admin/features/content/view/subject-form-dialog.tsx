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
import { cn } from "@workspace/ui/lib/utils"
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

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
  const [dragOver, setDragOver] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

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
    setDragOver(false)
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

  function openThumbnailPicker() {
    if (uploading || pending) return
    thumbnailInputRef.current?.click()
  }

  function handleThumbnailDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragOver(false)
    if (uploading || pending) return
    const file = event.dataTransfer.files?.[0]
    if (file?.type.startsWith("image/")) {
      void handleThumbnailChange(file)
    } else {
      setUploadError("Choose a JPEG, PNG, WebP, or GIF image.")
    }
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
      <DialogContent className="sm:max-w-lg">
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
            <FieldLabel htmlFor="subject-thumbnail-input">Thumbnail</FieldLabel>
            <div className="flex flex-col gap-2">
              <div
                role="button"
                tabIndex={uploading || pending ? -1 : 0}
                aria-label={
                  imageUrl ? "Replace subject thumbnail" : "Upload subject thumbnail"
                }
                aria-disabled={uploading || pending}
                onKeyDown={(event) => {
                  if (uploading || pending) return
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    openThumbnailPicker()
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  if (!uploading && !pending) setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleThumbnailDrop}
                onClick={openThumbnailPicker}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
                  imageUrl ? "h-40 border-border/60" : "h-36",
                  dragOver
                    ? "border-[#6C5CE7] bg-[#6C5CE7]/5"
                    : "border-border/80 bg-muted/15 hover:border-[#6C5CE7]/40 hover:bg-muted/25",
                  (uploading || pending) && "pointer-events-none opacity-80"
                )}
              >
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={title ? `${title} thumbnail` : "Subject thumbnail"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 512px) 100vw"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 px-4 text-center transition-opacity",
                        dragOver
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                      )}
                    >
                      <Upload className="size-5 text-white" aria-hidden />
                      <p className="text-sm font-medium text-white">
                        Drop a new image or click to replace
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-6 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
                      <ImageIcon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drop image here or click to browse
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        JPEG, PNG, WebP, or GIF · max 2 MB
                      </p>
                    </div>
                  </div>
                )}

                {uploading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-[2px]">
                    <Loader2
                      className="size-6 animate-spin text-[#6C5CE7]"
                      aria-hidden
                    />
                    <p className="text-xs font-medium text-muted-foreground">
                      Uploading…
                    </p>
                  </div>
                ) : null}
              </div>

              {imageUrl ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    disabled={uploading || pending}
                    onClick={(event) => {
                      event.stopPropagation()
                      openThumbnailPicker()
                    }}
                  >
                    <Upload className="size-3.5" aria-hidden />
                    Replace image
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-xs text-muted-foreground hover:text-destructive"
                    disabled={uploading || pending}
                    onClick={(event) => {
                      event.stopPropagation()
                      setImageUrl(null)
                      setUploadError(null)
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Remove
                  </Button>
                </div>
              ) : null}

              <input
                ref={thumbnailInputRef}
                id="subject-thumbnail-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploading || pending}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  void handleThumbnailChange(file)
                  event.target.value = ""
                }}
              />
            </div>
            <FieldHint>Optional. Shown on subject cards in the student app.</FieldHint>
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
