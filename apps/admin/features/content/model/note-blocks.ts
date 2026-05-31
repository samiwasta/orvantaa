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
      steps: string[]
      tip?: string
    }
  | { type: "list"; items: string[] }
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
  steps: z.array(z.string()),
  tip: z.string().optional(),
})

const listBlock = z.object({
  type: z.literal("list"),
  items: z.array(z.string()),
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

export function createEmptyBlock(type: NoteBlockType): NoteBlock {
  switch (type) {
    case "paragraph":
      return { type: "paragraph", text: "" }
    case "heading":
      return { type: "heading", text: "" }
    case "definition":
      return { type: "definition", title: "", content: "" }
    case "example":
      return { type: "example", title: "", steps: [""], tip: "" }
    case "list":
      return { type: "list", items: [""] }
    case "callout":
      return { type: "callout", text: "" }
    case "quote":
      return { type: "quote", text: "" }
    case "image":
      return { type: "image", url: "", alt: "" }
  }
}

export function parseNoteBlocks(raw: unknown): NoteBlock[] {
  const parsed = noteBlocksSchema.safeParse(raw)
  return parsed.success ? parsed.data : []
}

export function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function listToLines(items: string[]): string {
  return items.join("\n")
}
