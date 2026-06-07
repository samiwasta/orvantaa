import { prisma } from "@/lib/db"

import {
  createEmptyReportCard,
  DEFAULT_REPORT_CARD_EXAMS,
  type ExamKey,
  type ReportCard,
} from "../model/performance-data"
import type { SaveReportCardInput } from "../model/report-card-request"

const EXAM_ORDER: ExamKey[] = ["unit1", "term1", "unit2", "final"]

function emptyScores(): Record<ExamKey, number | null> {
  return { unit1: null, term1: null, unit2: null, final: null }
}

export class ReportCardRepository {
  async getReportCardForUser(
    userId: string,
    classId: string
  ): Promise<ReportCard> {
    const subjects = await prisma.subject.findMany({
      where: { classId },
      orderBy: { orderIndex: "asc" },
      select: { id: true, title: true },
    })

    if (subjects.length === 0) {
      return createEmptyReportCard([])
    }

    const report = await prisma.studentReportCard.findUnique({
      where: { userId },
      include: {
        examColumns: { orderBy: { orderIndex: "asc" } },
        scores: true,
      },
    })

    if (!report) {
      return createEmptyReportCard(subjects)
    }

    const exams =
      report.examColumns.length > 0
        ? report.examColumns.map((column) => ({
            key: column.examKey as ExamKey,
            label: column.label,
            maxMarks: column.maxMarks,
          }))
        : DEFAULT_REPORT_CARD_EXAMS.map((exam) => ({ ...exam }))

    const scoreLookup = new Map<string, number | null>()
    for (const score of report.scores) {
      scoreLookup.set(
        `${score.subjectId}:${score.examKey}`,
        score.obtainedMarks
      )
    }

    const subjectIds = new Set(subjects.map((subject) => subject.id))

    return {
      id: report.id,
      title: report.title,
      exams,
      subjects: subjects
        .map((subject) => {
          const scores = emptyScores()
          for (const exam of exams) {
            const key = exam.key
            if (!EXAM_ORDER.includes(key)) continue
            scores[key] = scoreLookup.get(`${subject.id}:${key}`) ?? null
          }
          return {
            subjectId: subject.id,
            subject: subject.title,
            scores,
          }
        })
        .filter((subject) => subjectIds.has(subject.subjectId)),
    }
  }

  async saveReportCardForUser(
    userId: string,
    classId: string,
    input: SaveReportCardInput
  ): Promise<ReportCard> {
    const classSubjects = await prisma.subject.findMany({
      where: { classId },
      orderBy: { orderIndex: "asc" },
      select: { id: true, title: true },
    })

    const classSubjectIds = new Set(classSubjects.map((subject) => subject.id))

    if (classSubjects.length === 0) {
      throw new Error("No subjects are assigned to your class.")
    }

    for (const subject of input.subjects) {
      if (!classSubjectIds.has(subject.subjectId)) {
        throw new Error("One or more subjects are not assigned to your class.")
      }
    }

    for (const subject of input.subjects) {
      for (const exam of input.exams) {
        const obtained = subject.scores[exam.key]
        if (obtained === null || obtained === undefined) continue
        if (obtained > exam.maxMarks) {
          throw new Error(
            `Marks for ${exam.label} cannot exceed ${exam.maxMarks}.`
          )
        }
      }
    }

    const report = await prisma.$transaction(async (tx) => {
      const saved = await tx.studentReportCard.upsert({
        where: { userId },
        create: {
          userId,
          title: input.title?.trim() || "Report Card",
        },
        update: {
          title: input.title?.trim() || "Report Card",
        },
      })

      await tx.reportCardExamColumn.deleteMany({
        where: { reportCardId: saved.id },
      })
      await tx.reportCardSubjectScore.deleteMany({
        where: { reportCardId: saved.id },
      })

      await tx.reportCardExamColumn.createMany({
        data: input.exams.map((exam, index) => ({
          reportCardId: saved.id,
          examKey: exam.key,
          label: exam.label,
          maxMarks: exam.maxMarks,
          orderIndex: index,
        })),
      })

      const scoreRows = classSubjects.flatMap((subject) => {
        const payload = input.subjects.find(
          (item) => item.subjectId === subject.id
        )
        if (!payload) return []

        return input.exams
          .map((exam) => {
            const obtained = payload.scores[exam.key]
            if (obtained === null || obtained === undefined) return null
            return {
              reportCardId: saved.id,
              subjectId: subject.id,
              examKey: exam.key,
              obtainedMarks: obtained,
            }
          })
          .filter((row): row is NonNullable<typeof row> => row !== null)
      })

      if (scoreRows.length > 0) {
        await tx.reportCardSubjectScore.createMany({ data: scoreRows })
      }

      return saved
    })

    return this.getReportCardForUser(userId, classId)
  }
}

export const reportCardRepository = new ReportCardRepository()
