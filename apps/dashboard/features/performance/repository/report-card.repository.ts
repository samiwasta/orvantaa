import { prisma } from "@/lib/db"

import {
  createEmptyReportCard,
  DEFAULT_REPORT_CARD_EXAMS,
  emptyExamMaxMarks,
  emptyExamScores,
  type ExamKey,
  type ReportCard,
} from "../model/performance-data"
import type { SaveReportCardInput } from "../model/report-card-request"

const EXAM_ORDER: ExamKey[] = ["unit1", "term1", "unit2", "final"]

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

    const defaultMax = emptyExamMaxMarks(exams)
    const scoreLookup = new Map<
      string,
      { obtained: number | null; maxMarks: number | null }
    >()
    for (const score of report.scores) {
      scoreLookup.set(`${score.subjectId}:${score.examKey}`, {
        obtained: score.obtainedMarks,
        maxMarks: score.maxMarks,
      })
    }

    const subjectIds = new Set(subjects.map((subject) => subject.id))

    return {
      id: report.id,
      title: report.title,
      exams,
      subjects: subjects
        .map((subject) => {
          const scores = emptyExamScores()
          const maxMarks = { ...defaultMax }
          for (const exam of exams) {
            const key = exam.key
            if (!EXAM_ORDER.includes(key)) continue
            const stored = scoreLookup.get(`${subject.id}:${key}`)
            scores[key] = stored?.obtained ?? null
            maxMarks[key] =
              stored?.maxMarks && stored.maxMarks > 0
                ? stored.maxMarks
                : exam.maxMarks
          }
          return {
            subjectId: subject.id,
            subject: subject.title,
            scores,
            maxMarks,
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
        const maxMarks = subject.maxMarks[exam.key]
        const obtained = subject.scores[exam.key]
        if (maxMarks < 1) {
          throw new Error(`Max marks for ${exam.label} must be at least 1.`)
        }
        if (obtained === null || obtained === undefined) continue
        if (obtained > maxMarks) {
          throw new Error(
            `Marks for ${exam.label} cannot exceed ${maxMarks} for this subject.`
          )
        }
      }
    }

    await prisma.$transaction(async (tx) => {
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

        return input.exams.map((exam) => ({
          reportCardId: saved.id,
          subjectId: subject.id,
          examKey: exam.key,
          obtainedMarks: payload.scores[exam.key] ?? null,
          maxMarks: payload.maxMarks[exam.key] ?? exam.maxMarks,
        }))
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
