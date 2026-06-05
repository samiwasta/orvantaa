import { z } from "zod"

export const NOTE_BLOCK_TYPES = [
  "paragraph",
  "heading",
  "definition",
  "example",
  "list",
  "callout",
  "quote",
  "image",
] as const

export type NoteBlockType = (typeof NOTE_BLOCK_TYPES)[number]

export type NoteBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "definition"; title: string; content: string }
  | {
      type: "example"
      title: string
      body: string
      tip?: string
    }
  | { type: "list"; content: string }
  | { type: "callout"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; url: string; alt?: string }

const paragraphBlock = z.object({
  type: z.literal("paragraph"),
  text: z.string(),
})

const headingBlock = z.object({
  type: z.literal("heading"),
  text: z.string(),
})

const definitionBlock = z.object({
  type: z.literal("definition"),
  title: z.string(),
  content: z.string(),
})

const exampleBlock = z.object({
  type: z.literal("example"),
  title: z.string(),
  body: z.string(),
  tip: z.string().optional(),
})

const listBlock = z.object({
  type: z.literal("list"),
  content: z.string(),
})

const calloutBlock = z.object({
  type: z.literal("callout"),
  text: z.string(),
})

const quoteBlock = z.object({
  type: z.literal("quote"),
  text: z.string(),
})

const imageBlock = z.object({
  type: z.literal("image"),
  url: z.string(),
  alt: z.string().optional(),
})

export const noteBlockSchema = z.discriminatedUnion("type", [
  paragraphBlock,
  headingBlock,
  definitionBlock,
  exampleBlock,
  listBlock,
  calloutBlock,
  quoteBlock,
  imageBlock,
])

export const noteBlocksSchema = z.array(noteBlockSchema)

export const NOTE_BLOCK_LABELS: Record<NoteBlockType, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  definition: "Definition",
  example: "Example",
  list: "List",
  callout: "Quick tip",
  quote: "Quote",
  image: "Image",
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
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

export function createEmptyBlock(type: NoteBlockType): NoteBlock {
  switch (type) {
    case "paragraph":
      return { type: "paragraph", text: "" }
    case "heading":
      return { type: "heading", text: "" }
    case "definition":
      return { type: "definition", title: "", content: "" }
    case "example":
      return { type: "example", title: "", body: "", tip: "" }
    case "list":
      return { type: "list", content: "" }
    case "callout":
      return { type: "callout", text: "" }
    case "quote":
      return { type: "quote", text: "" }
    case "image":
      return { type: "image", url: "", alt: "" }
  }
}

export function parseNoteBlocks(raw: unknown): NoteBlock[] {
  if (!Array.isArray(raw)) return []
  const migrated = raw
    .map(migrateNoteBlock)
    .filter((block): block is NoteBlock => block !== null)
  const parsed = noteBlocksSchema.safeParse(migrated)
  return parsed.success ? parsed.data : []
}
