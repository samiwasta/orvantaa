import { prisma } from "@/lib/db"

import {
  formatClassDisplayName,
  formatSchoolCodeForClass,
} from "@/features/classes/model/class-list-item"

import { decodeContentClassSlug } from "../model/content-class-slug"
import type { ContentClassInstance } from "../model/content-class-item"
import type {
  ContentClassSubjectsResult,
  ContentSubjectListItem,
} from "../model/content-subject-list-item"

function compareContentInstances(
  a: ContentClassInstance,
  b: ContentClassInstance
): number {
  const school = a.schoolName.localeCompare(b.schoolName)
  if (school !== 0) return school

  const levelA = parseInt(a.className.match(/\d+/)?.[0] ?? "999", 10)
  const levelB = parseInt(b.className.match(/\d+/)?.[0] ?? "999", 10)
  if (levelA !== levelB) return levelA - levelB

  return (a.section ?? "").localeCompare(b.section ?? "")
}

export class ContentRepository {
  async findClassesForContent(): Promise<ContentClassInstance[]> {
    const rows = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        section: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            board: { select: { name: true } },
          },
        },
        _count: { select: { subjects: true } },
        subjects: {
          select: {
            _count: { select: { chapters: true } },
          },
        },
      },
    })

    const items: ContentClassInstance[] = rows.map((row) => ({
      id: row.id,
      schoolId: row.school.id,
      className: row.name,
      classDisplayName: formatClassDisplayName(row.name),
      section: row.section?.trim() || null,
      schoolName: row.school.name,
      schoolCode: formatSchoolCodeForClass(row.school.code, row.school.id),
      boardName: row.school.board.name,
      subjectCount: row._count.subjects,
      chapterCount: row.subjects.reduce(
        (sum, subject) => sum + subject._count.chapters,
        0
      ),
    }))

    return items.sort(compareContentInstances)
  }

  async findSubjectsForClassGrade(
    classNameParam: string
  ): Promise<ContentClassSubjectsResult | null> {
    const targetKey = decodeContentClassSlug(classNameParam).trim().toLowerCase()
    if (!targetKey) return null

    const rows = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        section: true,
        schoolId: true,
        subjects: {
          select: {
            slug: true,
            title: true,
            orderIndex: true,
            _count: { select: { chapters: true } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    })

    const matching = rows.filter(
      (row) => row.name.trim().toLowerCase() === targetKey
    )
    if (matching.length === 0) return null

    const sections = new Set<string>()
    const schoolIds = new Set<string>()
    const subjectAgg = new Map<
      string,
      {
        slug: string
        title: string
        orderIndex: number
        chapterCount: number
        offeringCount: number
        schoolIds: Set<string>
      }
    >()

    for (const row of matching) {
      schoolIds.add(row.schoolId)
      const section = row.section?.trim()
      if (section) sections.add(section)

      for (const subject of row.subjects) {
        let agg = subjectAgg.get(subject.slug)
        if (!agg) {
          agg = {
            slug: subject.slug,
            title: subject.title,
            orderIndex: subject.orderIndex,
            chapterCount: 0,
            offeringCount: 0,
            schoolIds: new Set(),
          }
          subjectAgg.set(subject.slug, agg)
        }
        agg.chapterCount += subject._count.chapters
        agg.offeringCount += 1
        agg.schoolIds.add(row.schoolId)
        agg.orderIndex = Math.min(agg.orderIndex, subject.orderIndex)
      }
    }

    const subjects: ContentSubjectListItem[] = [...subjectAgg.values()]
      .map((agg) => ({
        slug: agg.slug,
        title: agg.title,
        orderIndex: agg.orderIndex,
        chapterCount: agg.chapterCount,
        offeringCount: agg.offeringCount,
        schoolCount: agg.schoolIds.size,
      }))
      .sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex
        return a.title.localeCompare(b.title)
      })

    const canonicalName = matching[0]!.name

    return {
      className: canonicalName,
      classDisplayName: formatClassDisplayName(canonicalName),
      sections: [...sections].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
      schoolCount: schoolIds.size,
      subjects,
    }
  }
}

export const contentRepository = new ContentRepository()
