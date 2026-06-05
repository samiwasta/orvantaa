export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function looksLikeHtml(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.startsWith("<") && /<\w|<\//.test(trimmed)
}

export function normalizeRichContent(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (looksLikeHtml(trimmed)) return value
  const paragraphs = trimmed.split(/\n\n+/)
  return paragraphs
    .map((paragraph) => {
      const lines = escapeHtml(paragraph).split("\n").join("<br>")
      return `<p>${lines}</p>`
    })
    .join("")
}

export function isRichContentEmpty(html: string): boolean {
  const trimmed = html.trim()
  if (!trimmed) return true
  if (looksLikeHtml(trimmed)) {
    const withoutTags = trimmed
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim()
    if (withoutTags.length > 0) return false
    return !/data-latex=["'][^"']+["']|data-type=["'](?:inline|block)-math/.test(
      trimmed
    )
  }
  return trimmed.length === 0
}
