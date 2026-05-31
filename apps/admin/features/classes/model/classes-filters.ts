import {
  compareClassListItems,
  parseClassLevel,
  type ClassListItem,
} from "./class-list-item"

export type ClassGradeSummary = {
  key: string
  className: string
  classDisplayName: string
  sections: string[]
  schoolCount: number
  studentCount: number
  subjectCount: number
  instances: ClassListItem[]
}

function gradeKey(className: string): string {
  return className.trim().toLowerCase()
}

function collectSections(instances: ClassListItem[]): string[] {
  const sections = new Set<string>()
  for (const instance of instances) {
    for (const section of instance.sectionNames) {
      const trimmed = section.trim()
      if (trimmed) sections.add(trimmed)
    }
  }
  return [...sections].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

export const ALL_SCHOOLS = "all"
export const ALL_BOARDS = "all"

export function filterClasses(
  classes: ClassListItem[],
  query: string,
  schoolId: string,
  boardName: string
): ClassListItem[] {
  let result = classes

  if (schoolId !== ALL_SCHOOLS) {
    result = result.filter((c) => c.schoolId === schoolId)
  }

  if (boardName !== ALL_BOARDS) {
    result = result.filter((c) => c.boardName === boardName)
  }

  const q = query.trim().toLowerCase()
  if (!q) return result

  return result.filter((c) => {
    const haystack = [
      c.classDisplayName,
      c.className,
      ...c.sectionNames,
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

export function buildFilterOptions(classes: ClassListItem[]) {
  const schools = new Map<string, string>()
  const boards = new Set<string>()

  for (const c of classes) {
    schools.set(c.schoolId, c.schoolName)
    boards.add(c.boardName)
  }

  return {
    schools: [...schools.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    boards: [...boards].sort((a, b) => a.localeCompare(b)),
  }
}

export type ClassSchoolGroup = {
  schoolId: string
  schoolName: string
  schoolCode: string
  boardName: string
  classes: ClassListItem[]
}

export function groupClassesBySchool(classes: ClassListItem[]): ClassSchoolGroup[] {
  const groups: ClassSchoolGroup[] = []
  const indexBySchool = new Map<string, number>()

  for (const classItem of classes) {
    const existing = indexBySchool.get(classItem.schoolId)
    if (existing !== undefined) {
      groups[existing]?.classes.push(classItem)
      continue
    }

    indexBySchool.set(classItem.schoolId, groups.length)
    groups.push({
      schoolId: classItem.schoolId,
      schoolName: classItem.schoolName,
      schoolCode: classItem.schoolCode,
      boardName: classItem.boardName,
      classes: [classItem],
    })
  }

  return groups
}

export function aggregateClassesByGrade(
  classes: ClassListItem[]
): ClassGradeSummary[] {
  const map = new Map<string, ClassGradeSummary>()

  for (const classItem of classes) {
    const key = gradeKey(classItem.className)
    const existing = map.get(key)

    if (existing) {
      existing.instances.push(classItem)
      existing.studentCount += classItem.studentCount
      existing.subjectCount += classItem.subjectCount
      existing.schoolCount = new Set(
        existing.instances.map((i) => i.schoolId)
      ).size
      existing.sections = collectSections(existing.instances)
      continue
    }

    map.set(key, {
      key,
      className: classItem.className,
      classDisplayName: classItem.classDisplayName,
      sections: collectSections([classItem]),
      schoolCount: 1,
      studentCount: classItem.studentCount,
      subjectCount: classItem.subjectCount,
      instances: [classItem],
    })
  }

  const summaries = [...map.values()]
  summaries.sort((a, b) => parseClassLevel(a.className) - parseClassLevel(b.className))

  return summaries
}

export function pickPrimaryInstance(summary: ClassGradeSummary): ClassListItem {
  return [...summary.instances].sort(compareClassListItems)[0]!
}

export type ClassSchoolOffering = {
  schoolId: string
  schoolName: string
  schoolCode: string
  boardName: string
  sections: string[]
  studentCount: number
  subjectCount: number
}

export function groupInstancesBySchool(
  instances: ClassListItem[]
): ClassSchoolOffering[] {
  const map = new Map<string, ClassSchoolOffering>()

  for (const instance of instances) {
    const existing = map.get(instance.schoolId)

    if (existing) {
      for (const section of instance.sectionNames) {
        const trimmed = section.trim()
        if (trimmed && !existing.sections.includes(trimmed)) {
          existing.sections.push(trimmed)
        }
      }
      existing.studentCount += instance.studentCount
      existing.subjectCount += instance.subjectCount
      continue
    }

    map.set(instance.schoolId, {
      schoolId: instance.schoolId,
      schoolName: instance.schoolName,
      schoolCode: instance.schoolCode,
      boardName: instance.boardName,
      sections: instance.sectionNames.map((s) => s.trim()).filter(Boolean),
      studentCount: instance.studentCount,
      subjectCount: instance.subjectCount,
    })
  }

  return [...map.values()]
    .map((row) => ({
      ...row,
      sections: row.sections.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    }))
    .sort((a, b) => a.schoolName.localeCompare(b.schoolName))
}
