import { classSectionNames, type ClassListItem } from "./class-list-item"

export function filterClasses(
  classes: ClassListItem[],
  query: string
): ClassListItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return classes

  return classes.filter((c) => {
    const haystack = [
      c.classDisplayName,
      c.className,
      ...classSectionNames(c),
      c.schoolName,
      c.schoolCode,
      c.boardName,
      String(c.studentCount),
      String(c.subjectCount),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return haystack.includes(q)
  })
}
