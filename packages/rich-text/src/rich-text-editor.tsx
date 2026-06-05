"use client"

import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import { createRichTextExtensions, type RichTextVariant } from "./extensions"
import { RichTextToolbar } from "./rich-text-toolbar"
import { normalizeRichContent } from "./utils"

import "./styles.css"

export type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  variant?: RichTextVariant
  minHeight?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  variant = "full",
  minHeight = "7rem",
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createRichTextExtensions(variant, placeholder),
    content: normalizeRichContent(value),
    editorProps: {
      attributes: {
        class:
          "px-3 py-2.5 text-sm leading-relaxed text-foreground focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const normalized = normalizeRichContent(value)
    const current = editor.getHTML()
    if (current !== normalized) {
      editor.commands.setContent(normalized, { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div
      className={`rich-text-editor overflow-hidden rounded-xl border border-border/60 bg-white shadow-xs ${className}`}
    >
      <RichTextToolbar editor={editor} variant={variant} />
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
