import { Mathematics } from "@tiptap/extension-mathematics"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import type { Extensions } from "@tiptap/react"

import { KATEX_RENDER_OPTIONS } from "./katex-render"

import "katex/contrib/mhchem"

export type RichTextVariant = "full" | "compact" | "structured"

function configureMath(): Extensions[number] {
  return Mathematics.configure({
    katexOptions: KATEX_RENDER_OPTIONS,
  })
}

export function createRichTextExtensions(
  variant: RichTextVariant,
  placeholder?: string
): Extensions {
  const isStructured = variant === "structured"

  return [
    StarterKit.configure({
      bold: false,
      italic: false,
      strike: false,
      bulletList: isStructured ? undefined : false,
      orderedList: isStructured ? undefined : false,
      blockquote: false,
      heading: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    configureMath(),
    Placeholder.configure({
      placeholder:
        placeholder ??
        (isStructured
          ? "Write paragraphs, or use list buttons for bullet / numbered / nested lists…"
          : "Write here…"),
    }),
  ]
}
