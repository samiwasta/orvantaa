const SUBJECT_IMAGES: Record<string, string> = {
  mathematics: "/maths.jpg",
  english: "/english.jpg",
  science: "/physics.jpg",
  physics: "/physics.jpg",
  chemistry: "/chemistry.jpg",
  biology: "/biology.jpg",
}

export function subjectImageUrl(
  slug: string,
  imageUrl?: string | null
): string {
  if (imageUrl?.trim()) return imageUrl
  return SUBJECT_IMAGES[slug] ?? "/maths.jpg"
}
