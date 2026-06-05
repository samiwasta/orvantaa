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

export type NoteContent = {
  id: string
  topicId: string
  chapterSlug: string
  title: string
  lessonNumber: number
  totalLessons: number
  blocks: NoteBlock[]
}
