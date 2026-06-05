"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"
import { FlaskConical, List, ListOrdered, Sigma } from "lucide-react"

import { EquationInsertDialog } from "./equation-insert-dialog"
import type { EquationDialogMode } from "./katex-render"
import type { RichTextVariant } from "./extensions"

type RichTextToolbarProps = {
  editor: Editor | null
  variant: RichTextVariant
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex size-8 items-center justify-center rounded-md border text-foreground transition-colors ${
        active
          ? "border-[#6C5CE7]/40 bg-[#6C5CE7]/10 text-[#6C5CE7]"
          : "border-transparent hover:border-border/80 hover:bg-muted/60"
      }`}
    >
      {children}
    </button>
  )
}

export function RichTextToolbar({ editor, variant }: RichTextToolbarProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<EquationDialogMode>("math")
  const showLists = variant === "structured"

  function openDialog(mode: EquationDialogMode) {
    setDialogMode(mode)
    setDialogOpen(true)
  }

  function handleInsert(latex: string) {
    if (!editor) return
    editor.chain().focus().insertInlineMath({ latex }).run()
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/20 px-2 py-1.5">
        <ToolbarButton
          label="Math (LaTeX)"
          onClick={() => openDialog("math")}
        >
          <Sigma className="size-3.5" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Chemical formula"
          onClick={() => openDialog("chemistry")}
        >
          <FlaskConical className="size-3.5" aria-hidden />
        </ToolbarButton>

        {showLists && editor ? (
          <>
            <span className="mx-0.5 h-5 w-px bg-border/80" aria-hidden />
            <ToolbarButton
              label="Bullet list"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-3.5" aria-hidden />
            </ToolbarButton>
            <ToolbarButton
              label="Numbered list"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="size-3.5" aria-hidden />
            </ToolbarButton>
          </>
        ) : null}
      </div>

      <EquationInsertDialog
        open={dialogOpen}
        mode={dialogMode}
        onOpenChange={setDialogOpen}
        onInsert={handleInsert}
      />
    </>
  )
}
