"use client"

import { useRef, useState } from "react"
import Image from "next/image"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react"

export type ImageUploadFieldProps = {
  value: string
  onChange: (url: string) => void
  uploadEndpoint: string
  inputId?: string
  hint?: string
  previewAlt?: string
  compact?: boolean
  disabled?: boolean
}

export function ImageUploadField({
  value,
  onChange,
  uploadEndpoint,
  inputId = "image-upload-input",
  hint = "JPEG, PNG, WebP, or GIF · max 2 MB",
  previewAlt = "Uploaded image",
  compact = false,
  disabled = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const busy = disabled || uploading

  function openPicker() {
    if (busy) return
    fileInputRef.current?.click()
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragOver(false)
    if (busy) return
    const file = event.dataTransfer.files?.[0]
    if (file?.type.startsWith("image/")) {
      void uploadFile(file)
    } else {
      setUploadError("Choose a JPEG, PNG, WebP, or GIF image.")
    }
  }

  async function uploadFile(file: File | null) {
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const response = await fetch(uploadEndpoint, { method: "POST", body })
      const data = (await response.json()) as { url?: string; message?: string }
      if (!response.ok || !data.url) {
        setUploadError(data.message ?? "Upload failed.")
        return
      }
      onChange(data.url)
    } catch {
      setUploadError("Could not upload the image.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        aria-label={value ? "Replace image" : "Upload image"}
        aria-disabled={busy}
        onKeyDown={(event) => {
          if (busy) return
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openPicker()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!busy) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={openPicker}
        className={cn(
          "group relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          value ? (compact ? "h-32" : "h-40") : compact ? "h-28" : "h-36",
          dragOver
            ? "border-[#6C5CE7] bg-[#6C5CE7]/5"
            : "border-border/80 bg-muted/15 hover:border-[#6C5CE7]/40 hover:bg-muted/25",
          busy && "pointer-events-none opacity-80"
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt={previewAlt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw"
              unoptimized={value.startsWith("/")}
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
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-5 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
              <ImageIcon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop image here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          </div>
        )}

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-[2px]">
            <Loader2
              className="size-6 animate-spin text-[#6C5CE7]"
              aria-hidden
            />
            <p className="text-xs font-medium text-muted-foreground">Uploading…</p>
          </div>
        ) : null}
      </div>

      {value ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation()
              openPicker()
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
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation()
              onChange("")
              setUploadError(null)
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Remove
          </Button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          void uploadFile(file)
          event.target.value = ""
        }}
      />

      {uploadError ? (
        <p className="text-sm font-medium text-destructive">{uploadError}</p>
      ) : null}
    </div>
  )
}
