"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import {
  type EquationDialogMode,
  renderKatexPreview,
  toInsertLatex,
  toPreviewLatex,
} from "./katex-render"

const MODE_COPY: Record<
  EquationDialogMode,
  {
    title: string
    description: string
    label: string
    placeholder: string
    hint: string
    examples: string[]
  }
> = {
  math: {
    title: "Insert math",
    description: "Enter LaTeX on the left. The preview updates as you type.",
    label: "LaTeX expression",
    placeholder: "e.g. x^2 + y^2 = r^2\n\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
    hint: "Use standard LaTeX: fractions, roots, Greek letters, subscripts (^ and _).",
    examples: ["x^2", "E = mc^2", "\\frac{a}{b}", "\\sqrt{2}"],
  },
  chemistry: {
    title: "Insert chemical formula",
    description: "Enter a formula on the left. Preview uses chemistry notation (\\ce).",
    label: "Formula",
    placeholder: "e.g. H2O, CO2, NaCl, H2SO4",
    hint: "Type the formula only (no \\ce{} wrapper). Subscripts use numbers, e.g. H2SO4.",
    examples: ["H2O", "CO2", "NaCl", "Ca(OH)2"],
  },
}

export type EquationInsertDialogProps = {
  open: boolean
  mode: EquationDialogMode
  onOpenChange: (open: boolean) => void
  onInsert: (latex: string) => void
}

export function EquationInsertDialog({
  open,
  mode,
  onOpenChange,
  onInsert,
}: EquationInsertDialogProps) {
  const copy = MODE_COPY[mode]
  const [value, setValue] = useState("")

  useEffect(() => {
    if (open) setValue("")
  }, [open, mode])

  const previewLatex = useMemo(
    () => toPreviewLatex(value, mode),
    [value, mode]
  )
  const preview = useMemo(() => renderKatexPreview(previewLatex), [previewLatex])

  function handleInsert() {
    const latex = toInsertLatex(value, mode)
    if (!latex) return
    onInsert(latex)
    onOpenChange(false)
  }

  function applyExample(example: string) {
    setValue(example)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-border/60">
          <div className="flex flex-col gap-3 p-6">
            <Field>
              <FieldLabel htmlFor="equation-input">{copy.label}</FieldLabel>
              <Textarea
                id="equation-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={copy.placeholder}
                rows={8}
                className="min-h-[11rem] resize-y font-mono text-sm leading-relaxed"
                autoFocus
              />
              <FieldHint>{copy.hint}</FieldHint>
            </Field>
            <div className="flex flex-wrap gap-1.5">
              <span className="w-full text-xs font-medium text-muted-foreground">
                Examples
              </span>
              {copy.examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="rounded-md border border-border/60 bg-muted/30 px-2 py-1 font-mono text-xs text-foreground transition-colors hover:border-[#6C5CE7]/35 hover:bg-[#6C5CE7]/5"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col bg-muted/15 p-6">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Live preview
            </p>
            <div
              className={cn(
                "mt-3 flex min-h-[11rem] flex-1 flex-col items-center justify-center rounded-xl border border-border/60 bg-white p-6",
                !previewLatex && "border-dashed"
              )}
            >
              {!previewLatex ? (
                <p className="text-center text-sm text-muted-foreground">
                  Type an expression to see the preview
                </p>
              ) : preview.error ? (
                <p className="text-center text-sm font-medium text-destructive">
                  {preview.error}
                </p>
              ) : (
                <div
                  className="equation-preview katex-preview text-foreground [&_.katex]:text-[1.35rem]"
                  dangerouslySetInnerHTML={{ __html: preview.html }}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/10 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[#6C5CE7] text-white hover:bg-[#6C5CE7]/90"
            disabled={!toInsertLatex(value, mode)}
            onClick={handleInsert}
          >
            Insert into note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
