import katex from "katex"

import "katex/contrib/mhchem"

export const KATEX_RENDER_OPTIONS = {
  throwOnError: false,
  strict: "ignore" as const,
  macros: {
    "\\RR": "\\mathbb{R}",
    "\\NN": "\\mathbb{N}",
  },
}

export type EquationDialogMode = "math" | "chemistry"

export function sanitizeChemistryInput(input: string): string {
  return input
    .trim()
    .replace(/^\\ce\{/, "")
    .replace(/\}$/, "")
    .replace(/[{}]/g, "")
}

export function toInsertLatex(value: string, mode: EquationDialogMode): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (mode === "chemistry") {
    const formula = sanitizeChemistryInput(trimmed)
    return formula ? `\\ce{${formula}}` : null
  }
  return trimmed
}

export function toPreviewLatex(value: string, mode: EquationDialogMode): string {
  const insertLatex = toInsertLatex(value, mode)
  return insertLatex ?? ""
}

export function renderKatexPreview(latex: string): {
  html: string
  error: string | null
} {
  if (!latex.trim()) {
    return { html: "", error: null }
  }
  try {
    const html = katex.renderToString(latex, {
      ...KATEX_RENDER_OPTIONS,
      displayMode: false,
    })
    return { html, error: null }
  } catch {
    return { html: "", error: "Could not render this expression. Check your syntax." }
  }
}
