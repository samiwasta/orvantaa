"use client"

import { useEffect, useMemo } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import { createRichTextExtensions } from "./extensions"
import { isRichContentEmpty, normalizeRichContent } from "./utils"

import "./styles.css"

export type RichTextPreviewTone = "sky" | "emerald"

export type RichTextPreviewBlock =
  | "body"
  | "heading"
  | "label"
  | "quote"

export type RichTextContentProps = {
  html: string
  className?: string
  /** Set when HTML may include bullet/numbered/nested lists. */
  structured?: boolean
  /** Styled list markers for student-facing preview (example = sky, list block = emerald). */
  previewTone?: RichTextPreviewTone
  /** Student note preview: Poppins + block typography (use inside .note-student-preview). */
  studentPreview?: boolean
  /** Typography role when studentPreview is true. */
  previewBlock?: RichTextPreviewBlock
}

const STUDENT_PREVIEW_TIPTAP_CLASS: Record<RichTextPreviewBlock, string> = {
  body: "note-preview-prose-body",
  heading: "note-preview-prose-heading",
  label: "note-preview-prose-label",
  quote: "note-preview-prose-quote",
}

export function RichTextContent({
  html,
  className = "",
  structured = false,
  previewTone,
  studentPreview = false,
  previewBlock = "body",
}: RichTextContentProps) {
  const normalized = useMemo(() => normalizeRichContent(html), [html])
  const empty = isRichContentEmpty(normalized)

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: createRichTextExtensions(structured ? "structured" : "full"),
    content: normalized,
    editorProps: {
      attributes: {
        class: studentPreview
          ? STUDENT_PREVIEW_TIPTAP_CLASS[previewBlock]
          : "text-sm leading-relaxed text-foreground/90 sm:text-[15px] sm:leading-7",
      },
    },
  })

  useEffect(() => {
    if (!editor || empty) return
    editor.commands.setContent(normalized, { emitUpdate: false })
  }, [editor, normalized, empty])

  if (empty) return null

  return (
    <div
      className={`rich-text-content ${className}`}
      data-preview-tone={previewTone ?? undefined}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
