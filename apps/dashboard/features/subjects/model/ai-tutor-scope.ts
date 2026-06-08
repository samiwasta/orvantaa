import type { NoteBlock, NoteContent } from "./note-data"
import type { McqQuestion } from "./quiz-data"
import { optionDisplayLabel } from "./quiz-data"

export type AiTutorWidgetScope = {
  title: string
  mode?: "note" | "quiz"
  content?: string
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim()
}

function serializeNoteBlock(block: NoteBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "callout":
    case "quote":
      return htmlToPlainText(block.text)
    case "definition":
      return `${htmlToPlainText(block.title)}\n${htmlToPlainText(block.content)}`
    case "example":
      return [
        htmlToPlainText(block.title),
        htmlToPlainText(block.body),
        block.tip ? `Tip: ${htmlToPlainText(block.tip)}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    case "list":
      return htmlToPlainText(block.content)
    case "image":
      return block.alt ? `[Image: ${block.alt}]` : ""
    default:
      return ""
  }
}

export function serializeNoteScope(
  note: NoteContent,
  chapterTitle: string
): AiTutorWidgetScope {
  const body = note.blocks.map(serializeNoteBlock).filter(Boolean).join("\n\n")

  return {
    title: note.title,
    mode: "note",
    content: [`Chapter: ${chapterTitle}`, body]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 6000),
  }
}

export function serializeQuizQuestionScope({
  quizTitle,
  chapterTitle,
  questionNumber,
  question,
}: {
  quizTitle: string
  chapterTitle: string
  questionNumber: number
  question: McqQuestion
}): AiTutorWidgetScope {
  const optionLines = question.options.map(
    (option) => `${optionDisplayLabel(option.id)}. ${option.label}`
  )

  return {
    title: `${quizTitle} — Question ${questionNumber}`,
    mode: "quiz",
    content: [
      `Quiz: ${quizTitle}`,
      `Chapter: ${chapterTitle}`,
      `Question ${questionNumber}: ${htmlToPlainText(question.question)}`,
      "Options:",
      ...optionLines,
    ].join("\n"),
  }
}
