export type NoteNavItem = {
  id: string
  title: string
}

export function buildNoteNavigation(summaries: NoteNavItem[], noteId: string) {
  const index = summaries.findIndex((s) => s.id === noteId)
  const prevItem = index > 0 ? summaries[index - 1] : undefined
  const nextItem =
    index >= 0 && index < summaries.length - 1
      ? summaries[index + 1]
      : undefined

  return {
    prev: prevItem ? { id: prevItem.id, title: prevItem.title } : undefined,
    next: nextItem ? { id: nextItem.id, title: nextItem.title } : undefined,
  }
}
