export type SubjectCardItem = {
  id: string
  title: string
  completed: number
  total: number
  imageUrl: string
}

export const subjectCards: SubjectCardItem[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    completed: 3,
    total: 12,
    imageUrl: "/maths.jpg",
  },
  {
    id: "english",
    title: "English",
    completed: 7,
    total: 15,
    imageUrl: "/english.jpg",
  },
  {
    id: "physics",
    title: "Physics",
    completed: 2,
    total: 6,
    imageUrl: "/physics.jpg",
  },
  {
    id: "chemistry",
    title: "Chemistry",
    completed: 4,
    total: 10,
    imageUrl: "/chemistry.jpg",
  },
  {
    id: "biology",
    title: "Biology",
    completed: 7,
    total: 8,
    imageUrl: "/biology.jpg",
  },
]

export function getSubjectBySlug(slug: string): SubjectCardItem | undefined {
  return subjectCards.find((s) => s.id === slug)
}
