import type { NoteBlock } from "./note-data"

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function looksLikeHtml(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.startsWith("<") && /<\w|<\//.test(trimmed)
}

function plainToParagraphHtml(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ""
  if (looksLikeHtml(trimmed)) return trimmed
  return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br>")}</p>`
}

function legacyStepsToBody(steps: string[]): string {
  const parts = steps.map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return ""
  return parts.map((part) => plainToParagraphHtml(part)).join("")
}

function legacyItemsToContent(items: string[]): string {
  const parts = items.map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return ""
  const lis = parts
    .map((part) => {
      const inner = looksLikeHtml(part)
        ? part.replace(/^<p>|<\/p>$/gi, "")
        : escapeHtml(part)
      return `<li><p>${inner}</p></li>`
    })
    .join("")
  return `<ul>${lis}</ul>`
}

function migrateNoteBlock(block: unknown): NoteBlock | null {
  if (!block || typeof block !== "object" || !("type" in block)) return null
  const raw = block as Record<string, unknown>
  const type = raw.type

  switch (type) {
    case "paragraph":
      return { type: "paragraph", text: String(raw.text ?? "") }
    case "heading":
      return { type: "heading", text: String(raw.text ?? "") }
    case "definition":
      return {
        type: "definition",
        title: String(raw.title ?? ""),
        content: String(raw.content ?? ""),
      }
    case "example": {
      const title = String(raw.title ?? "")
      const tip = typeof raw.tip === "string" ? raw.tip : undefined
      const body =
        typeof raw.body === "string"
          ? raw.body
          : Array.isArray(raw.steps)
            ? legacyStepsToBody(raw.steps as string[])
            : ""
      return { type: "example", title, body, tip }
    }
    case "list": {
      const content =
        typeof raw.content === "string"
          ? raw.content
          : Array.isArray(raw.items)
            ? legacyItemsToContent(raw.items as string[])
            : ""
      return { type: "list", content }
    }
    case "callout":
      return { type: "callout", text: String(raw.text ?? "") }
    case "quote":
      return { type: "quote", text: String(raw.text ?? "") }
    case "image":
      return {
        type: "image",
        url: String(raw.url ?? ""),
        alt: typeof raw.alt === "string" ? raw.alt : undefined,
      }
    default:
      return null
  }
}

export function parseNoteBlocks(raw: unknown): NoteBlock[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(migrateNoteBlock)
    .filter((block): block is NoteBlock => block !== null)
}
