import {
  formatClassDisplayName,
  formatSchoolCodeForClass,
  parseClassLevel,
} from "@/features/classes/model/class-list-item"

export type ContentClassInstance = {
  id: string
  schoolId: string
  className: string
  classDisplayName: string
  sectionNames: string[]
  schoolName: string
  schoolCode: string
  boardName: string
  subjectCount: number
  chapterCount: number
}

export type ContentClassSummary = {
  key: string
  className: string
  classDisplayName: string
  sections: string[]
  schoolCount: number
  subjectCount: number
  chapterCount: number
  instances: ContentClassInstance[]
}

export { formatClassDisplayName, parseClassLevel }

function gradeKey(className: string): string {
  return className.trim().toLowerCase()
}

function collectSections(instances: ContentClassInstance[]): string[] {
  const sections = new Set<string>()
  for (const instance of instances) {
    for (const section of instance.sectionNames) {
      const trimmed = section.trim()
      if (trimmed) sections.add(trimmed)
    }
  }
  return [...sections].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

export function aggregateContentClassesByGrade(
  classes: ContentClassInstance[]
): ContentClassSummary[] {
  const map = new Map<string, ContentClassSummary>()

  for (const classItem of classes) {
    const key = gradeKey(classItem.className)
    const existing = map.get(key)

    if (existing) {
      existing.instances.push(classItem)
      existing.subjectCount += classItem.subjectCount
      existing.chapterCount += classItem.chapterCount
      existing.schoolCount = new Set(existing.instances.map((i) => i.schoolId)).size
      existing.sections = collectSections(existing.instances)
      continue
    }

    map.set(key, {
      key,
      className: classItem.className,
      classDisplayName: classItem.classDisplayName,
      sections: collectSections([classItem]),
      schoolCount: 1,
      subjectCount: classItem.subjectCount,
      chapterCount: classItem.chapterCount,
      instances: [classItem],
    })
  }

  return [...map.values()].sort(
    (a, b) => parseClassLevel(a.className) - parseClassLevel(b.className)
  )
}
